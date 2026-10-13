import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { BroadcastItem, BroadcastStatus, Page } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager } from "@/features/admin/components/admin-ui"
import { BroadcastActions, NewBroadcast } from "@/features/admin/components/broadcast-forms"
import { dateTime } from "@/features/admin/format"
import { findNavItem } from "@/features/admin/nav"
import { cn } from "@/lib/utils"

const href = "/admin/broadcasts"
export const metadata: Metadata = { title: findNavItem(href)?.label }

const tabs: { value: BroadcastStatus | "All"; label: string }[] = [
  { value: "All", label: "ทั้งหมด" },
  { value: "Draft", label: "ร่าง" },
  { value: "Scheduled", label: "ตั้งเวลาไว้" },
  { value: "Sending", label: "กำลังส่ง" },
  { value: "Sent", label: "ส่งแล้ว" },
  { value: "Cancelled", label: "ยกเลิก" },
]

const statusStyle: Record<BroadcastStatus, { label: string; cls: string }> = {
  Draft: { label: "ร่าง", cls: "bg-muted text-muted-foreground" },
  Scheduled: { label: "ตั้งเวลาไว้", cls: "bg-caution/15 text-caution" },
  Sending: { label: "กำลังส่ง", cls: "bg-caution/15 text-caution" },
  Sent: { label: "ส่งแล้ว", cls: "bg-primary/10 text-primary" },
  Cancelled: { label: "ยกเลิก", cls: "bg-muted text-muted-foreground" },
}

export default function BroadcastsPage({ searchParams }: PageProps<"/admin/broadcasts">) {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <BroadcastsContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function BroadcastsContent({ searchParams }: { searchParams: PageProps<"/admin/broadcasts">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const status = tabs.find((t) => t.value === one(sp.status))?.value ?? "All"
  const page = Math.max(1, Number(one(sp.page)) || 1)

  let eventId: number
  let data: Page<BroadcastItem>
  let distances: { id: number; name: string }[]
  let items: BroadcastItem[]
  try {
    eventId = await adminEventId()
    const query = new URLSearchParams({ page: String(page) })
    if (status !== "All") query.set("status", status)
    ;[data, distances] = await Promise.all([
      adminFetch<Page<BroadcastItem>>(`/events/${eventId}/broadcasts?${query}`),
      adminFetch<{ id: number; name: string }[]>(`/events/${eventId}/distances`),
    ])
    // รายการไม่มีตัวเลขผู้รับ ร่างต้องดึงรายตัวเพื่อให้เห็นจำนวนผู้รับก่อนส่ง
    items = await Promise.all(
      data.items.map((b) => (b.status === "Draft" ? adminFetch<BroadcastItem>(`/broadcasts/${b.id}`) : Promise.resolve(b))),
    )
  } catch (error) {
    return <ApiNotice error={error} />
  }
  const distanceName = (id: number | null) => (id == null ? "ทุกระยะ" : (distances.find((d) => d.id === id)?.name ?? `ระยะ #${id}`))

  return (
    <>
      <NewBroadcast eventId={eventId} distances={distances} />
      <nav className="flex flex-wrap gap-2" aria-label="กรองตามสถานะ">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "All" ? href : `${href}?status=${t.value}`}
            aria-current={t.value === status ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm", t.value === status ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? <AdminCard className="py-12 text-center text-muted-foreground">ยังไม่มีประกาศ</AdminCard> : null}

      <ul className="flex flex-col gap-3">
        {items.map((b) => (
          <li key={b.id}>
            <AdminCard className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold">{b.title}</h2>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyle[b.status].cls)}>{statusStyle[b.status].label}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{b.body}</p>
              <p className="text-xs text-muted-foreground">
                กลุ่มผู้รับ: {distanceName(b.audienceDistanceId)} · {b.onlyPaid ? "เฉพาะที่จ่ายแล้ว" : "รวมที่ยังรอจ่าย"} · สร้างโดย {b.createdBy ?? "—"} เมื่อ{" "}
                {dateTime(b.createdAt)}
              </p>
              {b.status !== "Draft" && b.status !== "Cancelled" ? (
                <p className="text-sm">
                  ผู้รับ {b.recipientCount.toLocaleString("th-TH")} คน · ส่งสำเร็จ {b.successCount.toLocaleString("th-TH")} · ไม่สำเร็จ {b.failCount.toLocaleString("th-TH")}
                  {b.scheduledAt && b.status === "Scheduled" ? ` · ตั้งเวลาส่ง ${dateTime(b.scheduledAt)}` : ""}
                  {b.sentAt ? ` · เสร็จเมื่อ ${dateTime(b.sentAt)}` : ""}
                </p>
              ) : null}
              <BroadcastActions broadcast={b} eventId={eventId} distances={distances} />
            </AdminCard>
          </li>
        ))}
      </ul>
      <Pager
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        hrefFor={(n) => `${href}?${status === "All" ? "" : `status=${status}&`}page=${n}`}
      />
    </>
  )
}
