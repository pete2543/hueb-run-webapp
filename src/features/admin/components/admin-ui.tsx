import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { OrderStatus, PaymentStatus } from "../api/types"
import { describeError } from "../api/server"
import { AdminCard } from "./admin-page"

const tones = {
  ok: "bg-primary/10 text-primary",
  wait: "bg-caution/15 text-caution",
  alert: "bg-warning/10 text-warning",
  off: "bg-muted text-muted-foreground",
} as const

const statusStyle: Record<string, { label: string; tone: keyof typeof tones }> = {
  Paid: { label: "จ่ายแล้ว", tone: "ok" },
  Verified: { label: "ยืนยันแล้ว", tone: "ok" },
  Pending: { label: "รอชำระ", tone: "wait" },
  Verifying: { label: "กำลังตรวจ", tone: "wait" },
  NeedsReview: { label: "รอตรวจสลิป", tone: "alert" },
  Rejected: { label: "ปฏิเสธ", tone: "alert" },
  Expired: { label: "หมดเวลา", tone: "off" },
  Cancelled: { label: "ยกเลิก", tone: "off" },
  Refunded: { label: "คืนเงินแล้ว", tone: "off" },
}

export function StatusBadge({ status }: { status: OrderStatus | PaymentStatus }) {
  const s = statusStyle[status] ?? { label: status, tone: "off" as const }
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[s.tone])}>
      {s.label}
    </span>
  )
}

export const statusLabel = (status: string) => statusStyle[status]?.label ?? status

/** ข้อความเมื่อโหลดข้อมูลจาก API ไม่ได้ */
export function ApiNotice({ error }: { error: unknown }) {
  return (
    <AdminCard className="flex items-start gap-3 border-warning/30 bg-warning/5">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
      <div>
        <h2 className="font-semibold">โหลดข้อมูลไม่สำเร็จ</h2>
        <p className="text-sm text-muted-foreground">{describeError(error)}</p>
      </div>
    </AdminCard>
  )
}

export function Pager({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number
  pageSize: number
  total: number
  hrefFor: (page: number) => string
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const link = "rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
  return (
    <nav className="flex items-center justify-between gap-3 text-sm" aria-label="เปลี่ยนหน้า">
      <span className="text-muted-foreground">
        ทั้งหมด {total.toLocaleString("th-TH")} รายการ · หน้า {page}/{pages}
      </span>
      <span className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={link}>
            ก่อนหน้า
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={hrefFor(page + 1)} className={link}>
            ถัดไป
          </Link>
        ) : null}
      </span>
    </nav>
  )
}
