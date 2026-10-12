import { Banknote, Clock3, ReceiptText, Users } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { Dashboard } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice } from "@/features/admin/components/admin-ui"
import { baht, dateTime } from "@/features/admin/format"

export const metadata: Metadata = { title: "แดชบอร์ด" }

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader href="/admin" />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <DashboardContent />
      </Suspense>
    </>
  )
}

async function DashboardContent() {
  let data: Dashboard
  try {
    data = await adminFetch<Dashboard>(`/events/${await adminEventId()}/dashboard`)
  } catch (error) {
    return <ApiNotice error={error} />
  }

  const kpis = [
    {
      label: "รายได้ที่ยืนยันแล้ว",
      value: baht(data.revenue.paid),
      icon: Banknote,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "นักวิ่งที่จ่ายแล้ว",
      value: `${data.paidRunners.toLocaleString("th-TH")} คน`,
      icon: Users,
      tone: "bg-[#7c9be0]/15 text-[#3d63c9]",
    },
    {
      label: "รอชำระ",
      value: `${data.pendingRunners.toLocaleString("th-TH")} คน · ${baht(data.revenue.pendingAmount)}`,
      icon: Clock3,
      tone: "bg-caution/15 text-caution",
    },
    {
      label: "สลิปรอตรวจ",
      value: `${data.payments.needsReview} ใบ`,
      icon: ReceiptText,
      tone: "bg-warning/10 text-warning",
      href: "/admin/payments",
    },
  ]

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, tone, href }) => (
          <li key={label}>
            <AdminCard className="flex h-full flex-col gap-3 p-4 sm:p-5">
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
              {href ? (
                <Link href={href} className="font-heading text-xl font-bold underline-offset-4 hover:underline sm:text-2xl">
                  {value}
                </Link>
              ) : (
                <span className="font-heading text-xl font-bold sm:text-2xl">{value}</span>
              )}
            </AdminCard>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">โควตาแต่ละระยะ</h2>
          <ul className="flex flex-col gap-4">
            {data.distances.map((d) => (
              <li key={d.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <strong>{d.name}</strong>
                  <span className="text-muted-foreground">
                    จอง {d.reserved}/{d.quota} · เหลือ {d.remaining}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${d.quota ? Math.min(100, (d.reserved / d.quota) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  จ่ายแล้ว {d.paidRunners} · รอจ่าย {d.pendingRunners}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">สต็อกเสื้อ</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">ไซซ์</th>
                <th className="pb-2 text-right font-medium">สต็อก</th>
                <th className="pb-2 text-right font-medium">จอง</th>
                <th className="pb-2 text-right font-medium">เหลือ</th>
              </tr>
            </thead>
            <tbody>
              {data.shirts.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="py-2 font-medium">{s.size}</td>
                  <td className="py-2 text-right">{s.stock}</td>
                  <td className="py-2 text-right">{s.reserved}</td>
                  <td className="py-2 text-right font-semibold">{s.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      </div>

      <AdminCard className="text-sm text-muted-foreground">
        ออเดอร์ทั้งหมด {data.orders.total} · จ่ายแล้ว {data.orders.paid} · รอชำระ {data.orders.pending} ·
        หมดเวลา {data.orders.expired} · ยกเลิก {data.orders.cancelled} · คืนเงิน {data.orders.refunded}
        <span className="block">ข้อมูล ณ {dateTime(data.asOf)}</span>
      </AdminCard>
    </>
  )
}
