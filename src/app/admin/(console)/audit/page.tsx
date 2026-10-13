import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { adminFetch } from "@/features/admin/api/server"
import type { AdminUserDto, AuditItem, Page } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice, Pager } from "@/features/admin/components/admin-ui"
import { actionLabel, actionGroups, changedFields } from "@/features/admin/audit"
import { dateTime } from "@/features/admin/format"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/audit"
export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <AuditContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

const dayMs = 24 * 60 * 60 * 1000
/** วันที่ (เวลาไทย) → เวลา UTC ที่ API ต้องการ; to นับรวมทั้งวัน = เริ่มวันถัดไป (API ไม่รวมค่า to) */
function bangkokDay(day: string, plusDays = 0) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const t = Date.parse(`${day}T00:00:00+07:00`)
  return Number.isNaN(t) ? null : new Date(t + plusDays * dayMs).toISOString()
}

const field = "h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"

async function AuditContent({ searchParams }: { searchParams: PageProps<"/admin/audit">["searchParams"] }) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""
  const userId = one(sp.userId)
  const action = one(sp.action)
  const from = one(sp.from)
  const to = one(sp.to)
  const page = Math.max(1, Number(one(sp.page)) || 1)

  const query = new URLSearchParams({ page: String(page), pageSize: "25" })
  if (userId) query.set("userId", userId)
  if (action) query.set("action", action)
  const fromIso = bangkokDay(from)
  const toIso = bangkokDay(to, 1)
  if (fromIso) query.set("from", fromIso)
  if (toIso) query.set("to", toIso)

  let data: Page<AuditItem>
  let users: AdminUserDto[]
  try {
    ;[data, users] = await Promise.all([adminFetch<Page<AuditItem>>(`/audit?${query}`), adminFetch<AdminUserDto[]>("/users")])
  } catch (error) {
    return <ApiNotice error={error} />
  }

  const keep = new URLSearchParams()
  if (userId) keep.set("userId", userId)
  if (action) keep.set("action", action)
  if (from) keep.set("from", from)
  if (to) keep.set("to", to)

  return (
    <>
      <AdminCard>
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="flex flex-col gap-1 text-sm">
            ผู้ใช้
            <select name="userId" defaultValue={userId} className={field}>
              <option value="">ทุกคน</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            การกระทำ
            <select name="action" defaultValue={action} className={field}>
              <option value="">ทั้งหมด</option>
              {actionGroups.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            ตั้งแต่วันที่
            <input type="date" name="from" defaultValue={from} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            ถึงวันที่
            <input type="date" name="to" defaultValue={to} className={field} />
          </label>
          <span className="flex gap-2">
            <button className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">กรอง</button>
            <Link href={href} className="inline-flex h-10 items-center rounded-lg border px-4 text-sm hover:bg-muted">
              ล้าง
            </Link>
          </span>
        </form>
      </AdminCard>

      {data.items.length === 0 ? <AdminCard className="py-12 text-center text-muted-foreground">ไม่มีรายการ</AdminCard> : null}

      <ul className="flex flex-col gap-2">
        {data.items.map((a) => {
          const changes = changedFields(a.oldValues, a.newValues)
          return (
            <li key={a.id}>
              <AdminCard className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{actionLabel(a.action)}</span>
                  <span className="text-xs text-muted-foreground">{dateTime(a.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  โดย {a.userName ?? "ไม่ทราบผู้ใช้"} · {a.entityType} <span className="font-mono">{a.entityId}</span>
                  {a.ipAddress ? ` · IP ${a.ipAddress}` : ""} · <span className="font-mono text-xs">{a.action}</span>
                </p>
                {changes.length > 0 ? (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary">ดูค่าที่เปลี่ยน ({changes.length})</summary>
                    <div className="mt-2 overflow-x-auto rounded-lg border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-1.5">ฟิลด์</th>
                            <th className="px-3 py-1.5">ค่าเดิม</th>
                            <th className="px-3 py-1.5">ค่าใหม่</th>
                          </tr>
                        </thead>
                        <tbody>
                          {changes.map((c) => (
                            <tr key={c.key} className="border-t align-top">
                              <td className="px-3 py-1.5 font-mono">{c.key}</td>
                              <td className="px-3 py-1.5 break-all text-muted-foreground">{c.before}</td>
                              <td className="px-3 py-1.5 break-all">{c.after}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ) : null}
              </AdminCard>
            </li>
          )
        })}
      </ul>
      <Pager
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        hrefFor={(n) => `${href}?${new URLSearchParams({ ...Object.fromEntries(keep), page: String(n) })}`}
      />
    </>
  )
}
