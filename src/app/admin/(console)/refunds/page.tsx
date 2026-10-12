import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { Page, RefundItem, RefundStatus } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager } from "@/features/admin/components/admin-ui"
import { RefundActions } from "@/features/admin/components/refund-forms"
import { baht, dateTime } from "@/features/admin/format"
import { findNavItem } from "@/features/admin/nav"
import { cn } from "@/lib/utils"

const href = "/admin/refunds"
export const metadata: Metadata = { title: findNavItem(href)?.label }

const tabs: { value: RefundStatus; label: string }[] = [
  { value: "Requested", label: "รออนุมัติ" },
  { value: "Approved", label: "รอโอนคืน" },
  { value: "Completed", label: "คืนแล้ว" },
  { value: "Rejected", label: "ปฏิเสธ" },
]

export default function RefundsPage({ searchParams }: PageProps<"/admin/refunds">) {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <RefundsContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function RefundsContent({ searchParams }: { searchParams: PageProps<"/admin/refunds">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const status = tabs.find((t) => t.value === one(sp.status))?.value ?? "Requested"
  const page = Math.max(1, Number(one(sp.page)) || 1)

  let data: Page<RefundItem>
  try {
    data = await adminFetch<Page<RefundItem>>(`/events/${await adminEventId()}/refunds?status=${status}&page=${page}`)
  } catch (error) {
    return <ApiNotice error={error} />
  }

  return (
    <>
      <nav className="flex flex-wrap gap-2" aria-label="กรองตามสถานะ">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`${href}?status=${t.value}`}
            aria-current={t.value === status ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm", t.value === status ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? <AdminCard className="py-12 text-center text-muted-foreground">ไม่มีรายการ</AdminCard> : null}

      <ul className="flex flex-col gap-3">
        {data.items.map((r) => (
          <li key={r.refundId}>
            <AdminCard className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Link href={`/admin/orders/${r.orderId}`} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {r.orderNo}
                  </Link>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {r.kind === "Order" ? "คืนทั้งออเดอร์" : "คืนสลิปที่ซ้ำซ้อน"}
                  </span>
                </span>
                <span className="font-heading text-lg font-bold">{baht(r.amount)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {r.contactName} · {r.phone} · ขอโดย {r.requestedBy} เมื่อ {dateTime(r.createdAt)}
              </p>
              <p className="text-sm">เหตุผล: {r.reason}</p>
              {r.note ? <p className="text-sm text-muted-foreground">หมายเหตุ: {r.note}</p> : null}
              {r.externalRef ? <p className="text-sm text-muted-foreground">เลขอ้างอิงการโอนคืน: {r.externalRef}</p> : null}
              {r.approvedBy ? <p className="text-xs text-muted-foreground">ดำเนินการโดย {r.approvedBy} · {dateTime(r.processedAt)}</p> : null}
              <RefundActions refund={r} />
            </AdminCard>
          </li>
        ))}
      </ul>
      <Pager page={data.page} pageSize={data.pageSize} total={data.total} hrefFor={(n) => `${href}?status=${status}&page=${n}`} />
    </>
  )
}
