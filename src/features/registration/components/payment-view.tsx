"use client"

import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Download,
  ImageUp,
  Info,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Mascot } from "@/components/mascot"
import { formatBaht } from "@/lib/format"
import { cn } from "@/lib/utils"
import { getOrderStatus, uploadSlip } from "../actions"
import { clearDraft, getDraft, setDraft } from "../draft-store"
import type { OrderSummary, PaymentInfo } from "../types"

const loadAlert = () => import("@/lib/alert")
const pollMs = 3000
const warnBelowMs = 5 * 60 * 1000

/** เวลาที่เหลือก่อนหมดเวลาจอง (ms) อัปเดตทุกวินาที */
function useTimeLeft(expiresAt: string) {
  const deadline = Date.parse(expiresAt)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  return Math.max(0, deadline - now)
}

function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** ย่อรูปสลิปให้ไม่เกิน 1600px ก่อนส่ง (ประหยัดเน็ตมือถือ) ถ้าย่อไม่ได้ เช่น HEIC ใช้ไฟล์เดิม */
async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 900_000) return file
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    )
    if (!blob) return file
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  }
}

export function PaymentView({
  initialOrder,
  payment,
  qrSvg,
  qrPng,
}: {
  initialOrder: OrderSummary
  payment: PaymentInfo
  qrSvg: string
  qrPng: string
}) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const timeLeft = useTimeLeft(order.expiresAt)
  // ยังต้องโอน/แนบสลิปใหม่ (รวมกรณีสลิปไม่ผ่าน) นับถอยหลังต่อ
  // ส่งสลิปแล้วรอตรวจ หยุดนับ (ระบบถือว่าโอนก่อนหมดเวลา)
  const waitingForPayment =
    order.status === "Pending" &&
    (order.paymentStatus === "Pending" || order.paymentStatus === "Rejected")
  const expired = order.status === "Expired" || (waitingForPayment && timeLeft === 0)

  // รอผลตรวจสลิป: ถามสถานะซ้ำจนกว่าจะรู้ผล
  useEffect(() => {
    if (order.paymentStatus !== "Verifying") return
    const timer = setInterval(async () => {
      const result = await getOrderStatus(order.orderId)
      if (result.ok) setOrder(result.data)
    }, pollMs)
    return () => clearInterval(timer)
  }, [order.orderId, order.paymentStatus])

  // จ่ายสำเร็จ: ล้างข้อมูลที่กรอกไว้ในเครื่อง แล้วไปหน้าบัตรนักวิ่ง
  useEffect(() => {
    if (order.status !== "Paid") return
    clearDraft()
    router.replace(`/register/success/${order.orderId}`)
  }, [order.status, order.orderId, router])

  // หมดเวลา: ไม่ต้องเตือนให้กลับมาจ่ายใบนี้อีก
  useEffect(() => {
    if (!expired) return
    const draft = getDraft()
    if (draft.pendingOrder?.orderId === order.orderId) {
      setDraft({ ...draft, pendingOrder: undefined })
    }
  }, [expired, order.orderId])

  if (expired) return <ExpiredState orderNo={order.orderNo} />
  if (order.status === "Paid")
    return <CheckingState title="ชำระเงินสำเร็จ" text="กำลังพาไปหน้าบัตรนักวิ่ง…" />

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-8">
      <div className="flex flex-col gap-4">
        <Countdown timeLeft={timeLeft} paused={!waitingForPayment} />
        <QrCard order={order} payment={payment} qrSvg={qrSvg} qrPng={qrPng} />
      </div>

      <div className="flex flex-col gap-4">
        <HowToPay amount={order.payableAmount} />
        {order.paymentStatus === "Verifying" ? (
          <CheckingState
            title="กำลังตรวจสลิป…"
            text="ปกติใช้เวลาไม่กี่นาที ปิดหน้านี้ได้ ระบบจะแจ้งผลทาง LINE"
          />
        ) : order.paymentStatus === "NeedsReview" ? (
          <CheckingState
            title="ส่งให้เจ้าหน้าที่ตรวจ"
            text="ระบบตรวจอัตโนมัติไม่ได้ เจ้าหน้าที่จะตรวจให้และแจ้งผลทาง LINE ไม่ต้องโอนซ้ำ"
          />
        ) : (
          <SlipUpload
            orderId={order.orderId}
            rejectReason={order.paymentStatus === "Rejected" ? order.rejectReason : null}
            onUploaded={setOrder}
          />
        )}
      </div>
    </div>
  )
}

function Countdown({ timeLeft, paused }: { timeLeft: number; paused: boolean }) {
  const warn = !paused && timeLeft <= warnBelowMs
  const minutes = Math.ceil(timeLeft / 60000)
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4",
        warn ? "border-warning/40 bg-warning/5" : "bg-white",
      )}
    >
      <Clock
        className={cn("size-6 shrink-0", warn ? "text-warning" : "text-primary")}
        aria-hidden
      />
      <p className="grow text-sm">
        {paused ? "ได้รับสลิปแล้ว ไม่ต้องรีบ" : "เก็บที่ไว้ให้คุณอีก"}
        {warn ? (
          <span className="block text-xs text-warning">ใกล้หมดเวลา โอนและแนบสลิปเลย</span>
        ) : null}
      </p>
      {paused ? null : (
        <>
          <span
            role="timer"
            aria-hidden
            className={cn(
              "font-heading text-2xl font-bold tabular-nums",
              warn ? "text-warning" : "text-foreground",
            )}
          >
            {formatClock(timeLeft)}
          </span>
          {/* โปรแกรมอ่านหน้าจออ่านเป็นนาที ไม่อ่านทุกวินาที */}
          <span className="sr-only" aria-live="polite">
            เหลือเวลาประมาณ {minutes} นาที
          </span>
        </>
      )}
    </div>
  )
}

function QrCard({
  order,
  payment,
  qrSvg,
  qrPng,
}: {
  order: OrderSummary
  payment: PaymentInfo
  qrSvg: string
  qrPng: string
}) {
  const [baht, satang] = payment.payableAmount.toFixed(2).split(".")

  async function copyAmount() {
    const { toast } = await loadAlert()
    try {
      await navigator.clipboard.writeText(payment.payableAmount.toFixed(2))
      toast.fire({ icon: "success", title: "คัดลอกยอดเงินแล้ว" })
    } catch {
      toast.fire({ icon: "error", title: "คัดลอกไม่ได้ พิมพ์ยอดเองได้เลย" })
    }
  }

  return (
    <section
      aria-label="ข้อมูลการโอน"
      className="flex flex-col items-center gap-4 rounded-3xl border bg-white p-5 text-center shadow-sm shadow-primary/5 sm:p-6"
    >
      <p className="text-sm text-muted-foreground">ใบสมัครเลขที่ {order.orderNo}</p>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-muted-foreground">ยอดที่ต้องโอน</p>
        <p className="font-heading text-4xl font-bold sm:text-5xl">
          ฿{Number(baht).toLocaleString("th-TH")}
          <span className="text-primary">.{satang}</span>
        </p>
        <button
          type="button"
          onClick={copyAmount}
          className="flex min-h-11 items-center gap-1.5 px-3 text-sm font-semibold text-primary"
        >
          <Copy className="size-4" aria-hidden />
          คัดลอกยอด
        </button>
      </div>

      <div className="relative rounded-2xl border p-3">
        <div
          role="img"
          aria-label={
            payment.isDemo ? "QR ตัวอย่าง" : `QR PromptPay ยอด ${formatBaht(payment.payableAmount)}`
          }
          className="size-56 sm:size-64 [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        {payment.isDemo ? (
          <span className="absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-lg bg-warning/90 px-2 py-1 text-xs font-semibold text-white">
            QR ตัวอย่าง สแกนจ่ายไม่ได้
          </span>
        ) : null}
      </div>

      <div className="flex flex-col items-center">
        <p className="font-heading font-semibold text-primary">PromptPay</p>
        <p className="text-sm text-muted-foreground">{payment.accountName}</p>
      </div>

      <a
        href={qrPng}
        download={`HUEB-RUN-${order.orderNo}.png`}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/30 font-semibold text-primary hover:bg-muted"
      >
        <Download className="size-5" aria-hidden />
        บันทึกรูป QR
      </a>
      <p className="text-xs text-muted-foreground">
        บันทึกรูปแล้วเปิดในแอปธนาคาร เลือก &ldquo;สแกนจากรูปภาพ&rdquo;
      </p>
    </section>
  )
}

function HowToPay({ amount }: { amount: number }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-muted/60 p-4">
      <h2 className="flex items-center gap-2 font-heading font-semibold">
        <Info className="size-5 text-primary" aria-hidden />
        โอนตามยอดนี้ให้ตรงทุกสตางค์
      </h2>
      <ol className="flex flex-col gap-2 text-sm">
        {[
          "สแกน QR หรือบันทึกรูปไปเปิดในแอปธนาคาร",
          `ตรวจยอดให้เป็น ${formatBaht(amount)} (ระบบใช้เศษสตางค์จับคู่ใบสมัคร)`,
          "โอนเสร็จแล้วแนบรูปสลิปด้านล่าง",
        ].map((text, i) => (
          <li key={text} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>
    </section>
  )
}

function SlipUpload({
  orderId,
  rejectReason,
  onUploaded,
}: {
  orderId: string
  rejectReason: string | null
  onUploaded: (order: OrderSummary) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const [sending, startSending] = useTransition()

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function choose(next: File | undefined) {
    setError(undefined)
    if (!next) return
    if (!next.type.startsWith("image/")) {
      setError("เลือกได้เฉพาะไฟล์รูปภาพ")
      return
    }
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  function clear() {
    setFile(null)
    setPreview(null)
  }

  function submit() {
    if (!file) return
    startSending(async () => {
      const shrunk = await shrinkImage(file)
      const formData = new FormData()
      formData.set("slip", shrunk)
      formData.set("fileName", file.name)
      const result = await uploadSlip(orderId, formData)
      if (result.ok) {
        clear()
        onUploaded(result.data)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-sm shadow-primary/5 sm:p-6">
      <h2 className="font-heading text-lg font-semibold">โอนแล้ว? แนบสลิป</h2>

      {rejectReason ? (
        <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-destructive" aria-hidden />
          <p>
            <strong className="block">สลิปไม่ผ่านการตรวจ</strong>
            {rejectReason} ตรวจยอดแล้วแนบสลิปใหม่อีกครั้ง
          </p>
        </div>
      ) : null}

      {preview ? (
        <div className="relative flex justify-center rounded-2xl border bg-muted/50 p-3">
          <Image
            src={preview}
            alt="ตัวอย่างสลิปที่เลือก"
            width={320}
            height={480}
            unoptimized
            className="max-h-80 w-auto rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={clear}
            disabled={sending}
            aria-label="เอารูปออก"
            className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-white shadow-md"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      ) : (
        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/40 p-5 text-center transition hover:border-primary hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-primary/30">
          <ImageUp className="size-9 text-primary" aria-hidden />
          <span className="font-semibold">แตะเพื่อเลือกรูปสลิป</span>
          <span className="text-xs text-muted-foreground">JPG, PNG หรือภาพหน้าจอจากแอปธนาคาร</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              choose(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </label>
      )}

      {error ? (
        <p className="text-sm text-destructive" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={!file || sending}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {sending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <Check className="size-5" aria-hidden />
        )}
        {sending ? "กำลังส่ง…" : "ส่งสลิปให้ตรวจ"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        ระบบตรวจสลิปอัตโนมัติ ปกติใช้เวลาไม่กี่นาที แล้วแจ้งผลทาง LINE
      </p>
    </section>
  )
}

function CheckingState({ title, text }: { title: string; text: string }) {
  return (
    <section
      className="flex flex-col items-center gap-3 rounded-3xl border bg-white p-6 text-center"
      aria-live="polite"
    >
      <Mascot pose="thinking" sizes="140px" className="h-auto w-28" />
      <p className="flex items-center gap-2 font-heading text-lg font-semibold">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
        {title}
      </p>
      <p className="text-sm text-muted-foreground">{text}</p>
    </section>
  )
}

function ExpiredState({ orderNo }: { orderNo: string }) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border bg-white p-6 text-center">
      <Mascot pose="wai" sizes="160px" className="h-auto w-32" />
      <h2 className="font-heading text-2xl font-bold">หมดเวลาชำระเงิน</h2>
      <p className="text-muted-foreground">
        ใบสมัคร {orderNo} หมดเวลาแล้ว ระบบคืนที่ให้คนอื่น ข้อมูลที่กรอกไว้ยังอยู่
        สมัครใหม่ได้เลยถ้ายังมีที่ว่าง
      </p>
      <p className="text-sm text-muted-foreground">ถ้าโอนเงินไปแล้ว ติดต่อผู้จัดงานพร้อมสลิป</p>
      <Link
        href="/register/summary"
        className="flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
      >
        <RefreshCw className="size-4" aria-hidden />
        สมัครใหม่
      </Link>
    </section>
  )
}
