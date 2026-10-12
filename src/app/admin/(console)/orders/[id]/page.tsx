import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { adminFetch, adminSession } from "@/features/admin/api/server"
import type { OrderDetail } from "@/features/admin/api/types"
import { ApiError } from "@/lib/api/client"
import { AdminCard } from "@/features/admin/components/admin-page"
import { ApiNotice, StatusBadge } from "@/features/admin/components/admin-ui"
import { RequestRefund } from "@/features/admin/components/refund-forms"
import { TrackingForm } from "@/features/admin/components/tracking-form"
import { baht, dateTime } from "@/features/admin/format"

export const metadata: Metadata = { title: "รายละเอียดใบสมัคร" }

export default function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> กลับรายการ
      </Link>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <OrderContent params={params} />
      </Suspense>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value ?? "—"}</dd>
    </div>
  )
}

async function OrderContent({ params }: { params: PageProps<"/admin/orders/[id]">["params"] }) {
  const { id } = await params
  let o: OrderDetail
  try {
    o = await adminFetch<OrderDetail>(`/orders/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.code === "ORDER_NOT_FOUND") notFound()
    return <ApiNotice error={error} />
  }

  const { role } = await adminSession()
  const canTrack = (role === "SuperAdmin" || role === "Organizer") && o.status === "Paid" && o.shipping.type === "Post"

  const canRefund = (role === "SuperAdmin" || role === "Finance") && o.status === "Paid"

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{o.orderNo}</h1>
        <StatusBadge status={o.status} />
        {canRefund ? (
          <div className="ml-auto">
            <RequestRefund orderId={o.orderId} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <h2 className="mb-2 font-heading text-lg font-semibold">ผู้ติดต่อและยอดเงิน</h2>
          <dl className="divide-y">
            <Row label="ผู้ติดต่อ" value={o.contactName} />
            <Row label="เบอร์" value={o.phone} />
            <Row label="อีเมล" value={o.email} />
            <Row label="ค่าสมัคร" value={baht(o.subTotal)} />
            <Row label={`ส่วนลด${o.promoCode ? ` (${o.promoCode})` : ""}`} value={`-${baht(o.discountAmount)}`} />
            <Row label="ค่าจัดส่ง" value={baht(o.shippingFee)} />
            <Row label="ยอดรวม" value={baht(o.total)} />
            <Row label="ยอดโอน" value={baht(o.payableAmount)} />
            <Row label="สมัครเมื่อ" value={dateTime(o.createdAt)} />
            <Row label="หมดเวลาจ่าย" value={dateTime(o.expiresAt)} />
            <Row label="จ่ายเมื่อ" value={dateTime(o.paidAt)} />
          </dl>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-2 font-heading text-lg font-semibold">การรับของ</h2>
          <dl className="divide-y">
            <Row label="วิธีรับ" value={`${o.shipping.name} (${o.shipping.type === "Post" ? "ส่งไปรษณีย์" : "รับเอง"})`} />
            <Row label="เลขพัสดุ" value={canTrack ? null : o.shipping.trackingNo} />
            {o.shipping.type === "Post" ? (
              <>
                <Row label="ผู้รับ" value={o.shipping.shipName} />
                <Row label="เบอร์ผู้รับ" value={o.shipping.shipPhone} />
                <Row label="ที่อยู่" value={o.shipping.address} />
              </>
            ) : null}
          </dl>
          {canTrack ? <TrackingForm orderId={o.orderId} initial={o.shipping.trackingNo} /> : null}
        </AdminCard>
      </div>

      <AdminCard className="overflow-x-auto">
        <h2 className="mb-3 font-heading text-lg font-semibold">นักวิ่ง ({o.registrations.length})</h2>
        <table className="w-full min-w-160 text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 font-medium">ชื่อ</th>
              <th className="py-2 font-medium">ระยะ</th>
              <th className="py-2 font-medium">ไซซ์</th>
              <th className="py-2 font-medium">บิบ</th>
              <th className="py-2 text-right font-medium">ค่าสมัคร</th>
              <th className="py-2 font-medium">ฉุกเฉิน / โรคประจำตัว</th>
            </tr>
          </thead>
          <tbody>
            {o.registrations.map((r) => (
              <tr key={r.id} className="border-b align-top last:border-0">
                <td className="py-2">
                  {r.firstName} {r.lastName}
                  {r.isCancelled ? <span className="ml-1 text-xs text-warning">(ยกเลิก)</span> : null}
                  {r.teamName ? <span className="block text-xs text-muted-foreground">ทีม {r.teamName}</span> : null}
                </td>
                <td className="py-2">{r.distance}</td>
                <td className="py-2">{r.shirtSize}</td>
                <td className="py-2">{r.bibNumber ?? "—"}</td>
                <td className="py-2 text-right">{baht(r.pricePaid)}</td>
                <td className="py-2 text-xs text-muted-foreground">
                  {r.emergencyContactName ? `${r.emergencyContactName} ${r.emergencyContactPhone ?? ""}` : "—"}
                  {r.medicalNote ? <span className="block">{r.medicalNote}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      <AdminCard className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">ประวัติการชำระเงิน</h2>
        {o.payments.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีการส่งสลิป</p> : null}
        <ul className="divide-y">
          {o.payments.map((p) => (
            <li key={p.paymentId} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                {baht(p.expectedAmount)}
                {p.rejectReason ? <code className="text-xs text-muted-foreground">{p.rejectReason}</code> : null}
              </span>
              <span className="text-muted-foreground">
                {dateTime(p.createdAt)}
                {p.reviewNote ? ` · ${p.reviewNote}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </AdminCard>
    </>
  )
}
