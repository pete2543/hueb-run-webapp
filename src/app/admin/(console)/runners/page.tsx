import { Download } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch, adminSession } from "@/features/admin/api/server"
import type { Page, RunnerItem } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager } from "@/features/admin/components/admin-ui"
import { dateTime } from "@/features/admin/format"
import { findNavItem } from "@/features/admin/nav"
import { apiFetch } from "@/lib/api/client"

const href = "/admin/runners"
export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function RunnersPage({ searchParams }: PageProps<"/admin/runners">) {
  return (
    <>
      <Suspense fallback={<AdminPageHeader href={href} />}>
        <Header />
      </Suspense>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <RunnersContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function Header() {
  const { role } = await adminSession()
  const canExport = role === "SuperAdmin" || role === "Organizer"
  return (
    <AdminPageHeader
      href={href}
      actions={
        canExport ? (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- ดาวน์โหลดไฟล์ ไม่ใช่การเปลี่ยนหน้า
          <a
            href="/admin/runners/export"
            download
            className="inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium hover:bg-muted"
          >
            <Download className="size-4" aria-hidden /> ส่งออก Excel
          </a>
        ) : null
      }
    />
  )
}

async function RunnersContent({ searchParams }: { searchParams: PageProps<"/admin/runners">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const q = one(sp.q).trim()
  const distance = /^\d+$/.test(one(sp.distance)) ? one(sp.distance) : ""
  const page = Math.max(1, Number(one(sp.page)) || 1)

  const query = new URLSearchParams({ page: String(page) })
  if (q) query.set("q", q)
  if (distance) query.set("distance", distance)

  let data: Page<RunnerItem>
  let distances: { id: number; name: string }[] = []
  try {
    const slug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "hueb-run-2027"
    const [list, ds] = await Promise.all([
      adminEventId().then((id) => adminFetch<Page<RunnerItem>>(`/events/${id}/registrations?${query}`)),
      // รายการระยะจาก endpoint สาธารณะ (Finance เรียก /admin/.../distances ไม่ได้)
      apiFetch<{ id: number; name: string }[]>(`/events/${slug}/distances`, { cache: "no-store" }),
    ])
    data = list
    distances = ds
  } catch (error) {
    return <ApiNotice error={error} />
  }

  // Finance ได้ฟิลด์อ่อนไหวเป็น null ทั้งหมด จึงไม่แสดงคอลัมน์นี้
  const sensitive = data.items.some((r) => r.phone != null || r.emergencyContactName != null || r.medicalNote != null)

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
          placeholder="ค้นหาชื่อ เลขบิบ เลขออเดอร์ ทีม เบอร์"
          className="h-11 min-w-0 flex-1 rounded-xl border bg-white px-4 text-base outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 sm:min-w-72"
        />
        <select name="distance" defaultValue={distance} aria-label="ระยะ" className="h-11 rounded-xl border bg-white px-3 text-base">
          <option value="">ทุกระยะ</option>
          {distances.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground">ค้นหา</button>
      </form>

      <AdminCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-176 text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="p-3 font-medium">บิบ</th>
              <th className="p-3 font-medium">ชื่อ</th>
              <th className="p-3 font-medium">ระยะ</th>
              <th className="p-3 font-medium">ไซซ์</th>
              <th className="p-3 font-medium">ออเดอร์</th>
              {sensitive ? <th className="p-3 font-medium">ติดต่อ / ฉุกเฉิน</th> : null}
              <th className="p-3 font-medium">เช็กอิน</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((r) => (
              <tr key={r.registrationId} className="border-b align-top last:border-0 hover:bg-muted/40">
                <td className="p-3 font-mono font-semibold">{r.bibNumber ?? "—"}</td>
                <td className="p-3">
                  {r.firstName} {r.lastName}
                  {r.teamName ? <span className="block text-xs text-muted-foreground">ทีม {r.teamName}</span> : null}
                </td>
                <td className="p-3">{r.distance}</td>
                <td className="p-3">{r.shirtSize}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${r.orderId}`} className="text-primary underline-offset-4 hover:underline">
                    {r.orderNo}
                  </Link>
                </td>
                {sensitive ? (
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.phone ?? "—"}
                    {r.emergencyContactName ? (
                      <span className="block">
                        ฉุกเฉิน {r.emergencyContactName} {r.emergencyContactPhone ?? ""}
                      </span>
                    ) : null}
                    {r.medicalNote ? <span className="block text-warning">⚕ {r.medicalNote}</span> : null}
                  </td>
                ) : null}
                <td className="p-3 text-xs">
                  {r.checkedInAt ? <span className="text-primary">✓ {dateTime(r.checkedInAt)}</span> : <span className="text-muted-foreground">ยังไม่เช็กอิน</span>}
                </td>
              </tr>
            ))}
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={sensitive ? 7 : 6} className="p-8 text-center text-muted-foreground">
                  ไม่พบนักวิ่ง (แสดงเฉพาะที่จ่ายเงินแล้ว)
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
