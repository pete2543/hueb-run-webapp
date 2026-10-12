import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { OrderListItem, Page } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager, StatusBadge, statusLabel } from "@/features/admin/components/admin-ui"
import { baht, dateTime } from "@/features/admin/format"

const href = "/admin/orders"
export const metadata: Metadata = { title: "ใบสมัคร" }

const statuses = ["Pending", "Paid", "Expired", "Cancelled", "Refunded"]

export default function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function OrdersContent({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const q = one(sp.q).trim()
  const status = statuses.includes(one(sp.status)) ? one(sp.status) : ""
  const page = Math.max(1, Number(one(sp.page)) || 1)

  const query = new URLSearchParams({ page: String(page) })
  if (q) query.set("q", q)
  if (status) query.set("status", status)

  let data: Page<OrderListItem>
  try {
    data = await adminFetch<Page<OrderListItem>>(`/events/${await adminEventId()}/orders?${query}`)
  } catch (error) {
    return <ApiNotice error={error} />
  }

  const hrefFor = (p: number) => {
    const next = new URLSearchParams(query)
    next.set("page", String(p))
    return `${href}?${next}`
  }

  return (
    <>
      <form className="flex flex-wrap gap-2" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="ค้นหาเลขออเดอร์ ชื่อ เบอร์ เลขบิบ"
          className="h-11 min-w-0 flex-1 rounded-xl border bg-white px-4 text-base outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 sm:min-w-72"
        />
        <select
          name="status"
          defaultValue={status}
          aria-label="สถานะ"
          className="h-11 rounded-xl border bg-white px-3 text-base"
        >
          <option value="">ทุกสถานะ</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground">ค้นหา</button>
      </form>

      <AdminCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-176 text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="p-3 font-medium">เลขออเดอร์</th>
              <th className="p-3 font-medium">ผู้ติดต่อ</th>
              <th className="p-3 text-right font-medium">นักวิ่ง</th>
              <th className="p-3 text-right font-medium">ยอดโอน</th>
              <th className="p-3 font-medium">สถานะ</th>
              <th className="p-3 font-medium">สมัครเมื่อ</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((o) => (
              <tr key={o.orderId} className="border-b last:border-0 hover:bg-muted/40">
                <td className="p-3 font-medium">
                  <Link href={`${href}/${o.orderId}`} className="text-primary underline-offset-4 hover:underline">
                    {o.orderNo}
                  </Link>
                </td>
                <td className="p-3">
                  {o.contactName}
                  <span className="block text-xs text-muted-foreground">{o.phone}</span>
                </td>
                <td className="p-3 text-right">{o.runnerCount}</td>
                <td className="p-3 text-right">{baht(o.payableAmount)}</td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-3 text-muted-foreground">{dateTime(o.createdAt)}</td>
              </tr>
            ))}
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  ไม่พบใบสมัคร
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </AdminCard>
      <Pager page={data.page} pageSize={data.pageSize} total={data.total} hrefFor={hrefFor} />
    </>
  )
}
