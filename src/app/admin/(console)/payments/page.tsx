import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { Page, PaymentItem } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager, StatusBadge, statusLabel } from "@/features/admin/components/admin-ui"
import { PaymentActions } from "@/features/admin/components/payment-actions"
import { baht, dateTime } from "@/features/admin/format"
import { cn } from "@/lib/utils"

const href = "/admin/payments"
export const metadata: Metadata = { title: "ตรวจสลิป" }

const tabs = ["NeedsReview", "Verifying", "Rejected", "Verified", "Pending"]

const reasons: Record<string, string> = {
  DUPLICATE_UNKNOWN: "SlipOK บอกว่าสลิปซ้ำ แต่ระบบเราไม่มีสลิปใบนั้น — ดูรูปเทียบยอดก่อนอนุมัติ",
  VERIFY_TIMEOUT: "ตรวจอัตโนมัติไม่สำเร็จ (SlipOK ล่ม/โควตาหมด) — เช็กบัญชีธนาคารก่อนอนุมัติ หรือกดตรวจซ้ำ",
  ORDER_EXPIRED: "เงินเข้าแต่ออเดอร์หมดเวลาแล้ว — อนุมัติจะจองโควตาใหม่ให้ ถ้าเต็มต้องคืนเงิน",
  ALREADY_PAID: "ออเดอร์จ่ายแล้วด้วยสลิปอื่น สลิปนี้ซ้ำซ้อน — ปฏิเสธได้อย่างเดียว",
}

export default function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <PaymentsContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function PaymentsContent({ searchParams }: { searchParams: PageProps<"/admin/payments">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const status = tabs.includes(one(sp.status)) ? one(sp.status) : "NeedsReview"
  const page = Math.max(1, Number(one(sp.page)) || 1)

  let data: Page<PaymentItem>
  try {
    data = await adminFetch<Page<PaymentItem>>(
      `/events/${await adminEventId()}/payments?status=${status}&page=${page}`,
    )
  } catch (error) {
    return <ApiNotice error={error} />
  }

  return (
    <>
      <nav className="flex flex-wrap gap-2" aria-label="กรองตามสถานะ">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`${href}?status=${t}`}
            aria-current={t === status ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              t === status ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted",
            )}
          >
            {statusLabel(t)}
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? (
        <AdminCard className="py-12 text-center text-muted-foreground">
          ไม่มีรายการ{status === "NeedsReview" ? "รอตรวจ 🎉" : ""}
        </AdminCard>
      ) : null}

      <ul className="flex flex-col gap-3">
        {data.items.map((p) => (
          <li key={p.paymentId}>
            <AdminCard className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Link href={`/admin/orders/${p.orderId}`} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {p.orderNo}
                  </Link>
                  <StatusBadge status={p.status} />
                </span>
                <span className="font-heading text-lg font-bold">{baht(p.expectedAmount)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {p.contactName} · {p.phone} · {p.runnerCount} คน · ส่งสลิป {dateTime(p.createdAt)}
                {p.paidAmount != null ? ` · สลิประบุ ${baht(p.paidAmount)}` : ""}
              </p>
              {p.rejectReason && reasons[p.rejectReason] ? (
                <p className="rounded-lg bg-caution/10 p-2.5 text-sm">{reasons[p.rejectReason]}</p>
              ) : null}
              {p.reviewNote ? <p className="text-sm text-muted-foreground">หมายเหตุ: {p.reviewNote}</p> : null}
              {p.status === "NeedsReview" ? (
                <PaymentActions paymentId={p.paymentId} orderId={p.orderId} reason={p.rejectReason} />
              ) : null}
            </AdminCard>
          </li>
        ))}
      </ul>
      <Pager
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        hrefFor={(n) => `${href}?status=${status}&page=${n}`}
      />
    </>
  )
}
