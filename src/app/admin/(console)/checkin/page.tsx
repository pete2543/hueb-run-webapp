import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch, adminSession } from "@/features/admin/api/server"
import type { CheckInList } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager } from "@/features/admin/components/admin-ui"
import { RunnerActions, ScanBox } from "@/features/admin/components/checkin-desk"
import { dateTime } from "@/features/admin/format"
import { findNavItem } from "@/features/admin/nav"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"

const href = "/admin/checkin"
export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function CheckInPage({ searchParams }: PageProps<"/admin/checkin">) {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <CheckInContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

const tabs = [
  { value: "", label: "ทั้งหมด" },
  { value: "false", label: "ยังไม่เช็กอิน" },
  { value: "true", label: "เช็กอินแล้ว" },
]

async function CheckInContent({ searchParams }: { searchParams: PageProps<"/admin/checkin">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const q = one(sp.q).trim()
  const checkedIn = ["true", "false"].includes(one(sp.checkedIn)) ? one(sp.checkedIn) : ""
  const distance = /^\d+$/.test(one(sp.distance)) ? one(sp.distance) : ""
  const page = Math.max(1, Number(one(sp.page)) || 1)

  const query = new URLSearchParams({ page: String(page) })
  if (q) query.set("q", q)
  if (checkedIn) query.set("checkedIn", checkedIn)
  if (distance) query.set("distance", distance)

  const { role } = await adminSession()
  const canUndo = role === "SuperAdmin" || role === "Organizer"

  let data: CheckInList
  let distances: { id: number; name: string }[] = []
  try {
    const slug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "hueb-run-2027"
    ;[data, distances] = await Promise.all([
      adminEventId().then((id) => adminFetch<CheckInList>(`/events/${id}/checkins?${query}`)),
      apiFetch<{ id: number; name: string }[]>(`/events/${slug}/distances`, { cache: "no-store" }),
    ])
  } catch (error) {
    return <ApiNotice error={error} />
  }

  const { runners, summary } = data
  const pct = summary.paid ? Math.round((summary.checkedIn / summary.paid) * 100) : 0
  const tabHref = (v: string) => {
    const next = new URLSearchParams()
    if (q) next.set("q", q)
    if (distance) next.set("distance", distance)
    if (v) next.set("checkedIn", v)
    return `${href}?${next}`
  }
  const hrefFor = (p: number) => {
    const next = new URLSearchParams(query)
    next.set("page", String(p))
    return `${href}?${next}`
  }

  return (
    <>
      <AdminCard className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">สแกนตั๋ว</h2>
          <p className="text-sm text-muted-foreground">
            เช็กอินแล้ว <strong className="text-foreground">{summary.checkedIn}</strong> / {summary.paid} คน ({pct}%)
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <ScanBox canUndo={canUndo} />
      </AdminCard>

      <form className="flex flex-wrap gap-2" role="search">
        {checkedIn ? <input type="hidden" name="checkedIn" value={checkedIn} /> : null}
        <input
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อ เลขบิบ เลขออเดอร์"
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

      <nav className="flex flex-wrap gap-2" aria-label="กรองสถานะเช็กอิน">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={tabHref(t.value)}
            aria-current={t.value === checkedIn ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              t.value === checkedIn ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <AdminCard className="p-0 sm:p-0">
        <ul className="divide-y">
          {runners.items.map((r) => (
            <li key={r.registrationId} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p>
                  <span className="mr-2 font-mono font-bold">{r.bibNumber ?? "—"}</span>
                  <span className="font-medium">
                    {r.firstName} {r.lastName}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.distance} · เสื้อ {r.shirtSize} · {r.orderNo}
                  {r.checkedInAt ? ` · เช็กอิน ${dateTime(r.checkedInAt)}${r.checkedInBy ? ` โดย ${r.checkedInBy}` : ""}` : ""}
                </p>
              </div>
              <RunnerActions runner={r} canUndo={canUndo} />
            </li>
          ))}
          {runners.items.length === 0 ? <li className="p-8 text-center text-muted-foreground">ไม่พบนักวิ่ง</li> : null}
        </ul>
      </AdminCard>
      <Pager page={runners.page} pageSize={runners.pageSize} total={runners.total} hrefFor={hrefFor} />
    </>
  )
}
