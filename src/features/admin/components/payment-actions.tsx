"use client"

import { Check, ExternalLink, Loader2, RefreshCw, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { getSlipUrl, reviewPayment } from "../api/actions"
import { RequestRefund } from "./refund-forms"

/** ปุ่มตรวจสลิปตาม rejectReason (docs/admin-api-frontend-guide.md หัวข้อ 4) */
export function PaymentActions({ paymentId, orderId, reason }: { paymentId: number; orderId: string; reason: string | null }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState("")

  const canApprove = reason !== "ALREADY_PAID"
  const canRecheck = reason === "VERIFY_TIMEOUT"

  function run(action: "approve" | "reject" | "recheck") {
    if (action === "approve" && !confirm("ยืนยันอนุมัติสลิปนี้? ระบบจะออกเลขบิบให้นักวิ่งทันที")) return
    setError(null)
    start(async () => {
      const res = await reviewPayment(paymentId, action, note.trim())
      if (!res.ok) setError(res.error)
      else setRejecting(false)
      router.refresh()
    })
  }

  function openSlip() {
    setError(null)
    start(async () => {
      const res = await getSlipUrl(paymentId)
      if ("error" in res) setError(res.error)
      else window.open(res.url, "_blank", "noopener")
    })
  }

  const btn = "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium disabled:opacity-50"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={openSlip} disabled={pending} className={`${btn} hover:bg-muted`}>
          <ExternalLink className="size-4" aria-hidden /> ดูสลิป
        </button>
        {canApprove ? (
          <button type="button" onClick={() => run("approve")} disabled={pending} className={`${btn} border-transparent bg-primary text-primary-foreground`}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
            อนุมัติ
          </button>
        ) : null}
        {canRecheck ? (
          <button type="button" onClick={() => run("recheck")} disabled={pending} className={`${btn} hover:bg-muted`}>
            <RefreshCw className="size-4" aria-hidden /> ตรวจซ้ำ
          </button>
        ) : null}
        <button type="button" onClick={() => setRejecting((v) => !v)} disabled={pending} className={`${btn} text-destructive hover:bg-destructive/5`}>
          <X className="size-4" aria-hidden /> ปฏิเสธ
        </button>
      </div>
      {reason === "ALREADY_PAID" || reason === "ORDER_EXPIRED" ? (
        <RequestRefund orderId={orderId} paymentId={paymentId} />
      ) : null}
      {rejecting ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="เหตุผล (นักวิ่งจะเห็นข้อความนี้)"
            className="w-full rounded-lg border p-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            disabled={pending || !note.trim()}
            onClick={() => run("reject")}
            className={`${btn} w-fit border-transparent bg-destructive text-white`}
          >
            ยืนยันปฏิเสธ
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
