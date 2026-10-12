"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { processRefund, requestRefund } from "../api/actions"
import type { RefundItem } from "../api/types"

const field = "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"
const btn = "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium disabled:opacity-50"

/** ขอคืนเงิน: ไม่ส่ง paymentId = ออเดอร์ที่จ่ายแล้ว (คืนทั้งใบ) · ส่ง paymentId = สลิปรอตรวจที่ซ้ำซ้อน/โควตาเต็ม */
export function RequestRefund({ orderId, paymentId }: { orderId: string; paymentId?: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (done) return <p role="status" className="text-sm text-primary">ส่งคำขอคืนเงินแล้ว (ดูที่หน้าคืนเงิน)</p>
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${btn} text-destructive hover:bg-destructive/5`}>
        ขอคืนเงิน
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const amount = String(f.get("amount") ?? "")
        setError(null)
        start(async () => {
          const res = await requestRefund(orderId, {
            reason: String(f.get("reason")).trim(),
            paymentId,
            amount: amount ? Number(amount) : undefined,
          })
          if (!res.ok) return setError(res.error)
          setDone(true)
          router.refresh()
        })
      }}
      className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3"
    >
      <textarea name="reason" required maxLength={500} rows={2} placeholder="เหตุผลการคืนเงิน" className="w-full rounded-lg border bg-white p-2 text-sm outline-none focus:border-primary" />
      <input name="amount" type="number" step="0.01" min={0.01} placeholder="ยอดคืน (ว่าง = คืนเต็มจำนวน)" className={field} />
      <div className="flex gap-2">
        <button disabled={pending} className={`${btn} border-transparent bg-primary text-primary-foreground`}>ส่งคำขอ</button>
        <button type="button" onClick={() => setOpen(false)} className={btn}>ยกเลิก</button>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </form>
  )
}

/** ปุ่มตามสถานะ: Requested → อนุมัติ/ปฏิเสธ · Approved → โอนคืนแล้ว (ต้องใส่เลขอ้างอิง) */
export function RefundActions({ refund }: { refund: RefundItem }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"reject" | "complete" | null>(null)
  const [text, setText] = useState("")
  const [note, setNote] = useState("")

  function run(action: "approve" | "reject" | "complete") {
    setError(null)
    start(async () => {
      const res = await processRefund(
        refund.refundId,
        action,
        action === "reject" ? { note: text.trim() } : action === "complete" ? { externalRef: text.trim(), note: note.trim() || undefined } : undefined,
      )
      if (!res.ok) setError(res.error)
      else setMode(null)
      router.refresh()
    })
  }

  if (refund.status === "Completed" || refund.status === "Rejected") return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {refund.status === "Requested" ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const what = refund.kind === "Order" ? "นักวิ่งทุกคนในออเดอร์จะถูกยกเลิกและคืนโควตา/ไซซ์เสื้อ" : "สลิปนี้จะออกจากคิวตรวจสลิป"
                if (confirm(`อนุมัติคืนเงิน? ${what}`)) run("approve")
              }}
              className={`${btn} border-transparent bg-primary text-primary-foreground`}
            >
              อนุมัติ
            </button>
            <button type="button" disabled={pending} onClick={() => { setText(""); setMode(mode === "reject" ? null : "reject") }} className={`${btn} text-destructive hover:bg-destructive/5`}>
              ปฏิเสธ
            </button>
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => { setText(""); setMode(mode === "complete" ? null : "complete") }} className={`${btn} border-transparent bg-primary text-primary-foreground`}>
            โอนคืนแล้ว
          </button>
        )}
      </div>
      {mode ? (
        <div className="flex flex-col gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={mode === "complete" ? 100 : 500}
            placeholder={mode === "complete" ? "เลขอ้างอิงการโอนคืน (บังคับ)" : "เหตุผลที่ปฏิเสธ (บังคับ)"}
            className={field}
          />
          {mode === "complete" ? <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="หมายเหตุ (ไม่บังคับ)" className={field} /> : null}
          <button type="button" disabled={pending || !text.trim()} onClick={() => run(mode)} className={`${btn} w-fit border-transparent bg-primary text-primary-foreground`}>
            ยืนยัน
          </button>
          {mode === "complete" ? <p className="text-xs text-muted-foreground">ระบบไม่ได้โอนเงินให้ — โอนคืนนอกระบบก่อนแล้วค่อยกดยืนยัน</p> : null}
        </div>
      ) : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
