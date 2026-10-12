import type { Metadata } from "next"
import { Suspense } from "react"
import { adminEventId, adminFetch, adminSession } from "@/features/admin/api/server"
import type { AdminUserDto } from "@/features/admin/api/types"
import { roleLabels } from "@/features/admin/auth/access"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice } from "@/features/admin/components/admin-ui"
import { CreateUserForm, ToggleActive } from "@/features/admin/components/user-forms"
import { dateTime } from "@/features/admin/format"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/users"
export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function UsersPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <UsersContent />
      </Suspense>
    </>
  )
}

async function UsersContent() {
  let users: AdminUserDto[]
  let eventId: number
  const me = await adminSession()
  try {
    eventId = await adminEventId()
    users = await adminFetch<AdminUserDto[]>("/users")
  } catch (error) {
    return <ApiNotice error={error} />
  }

  return (
    <>
      <AdminCard className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">เพิ่มผู้ใช้</h2>
        <CreateUserForm eventId={eventId} />
        <p className="text-xs text-muted-foreground">
          ผู้ใช้ที่ไม่ใช่ผู้ดูแลระบบจะเข้าถึงได้เฉพาะงานปัจจุบัน · 1 คนมี 1 บทบาท
        </p>
      </AdminCard>

      <AdminCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-168 text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="p-3 font-medium">ชื่อ</th>
              <th className="p-3 font-medium">บทบาท</th>
              <th className="p-3 font-medium">เข้าระบบล่าสุด</th>
              <th className="p-3 font-medium">สถานะ</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3">
                  <strong>{u.name}</strong>
                  <span className="block text-xs text-muted-foreground">{u.email}</span>
                </td>
                <td className="p-3">{roleLabels[u.role]}</td>
                <td className="p-3 text-muted-foreground">{dateTime(u.lastLoginAt)}</td>
                <td className="p-3">{u.isActive ? "ใช้งาน" : <span className="text-muted-foreground">ปิดอยู่</span>}</td>
                <td className="p-3 text-right">
                  <ToggleActive id={u.id} isActive={u.isActive} disabled={u.id === me.userId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </>
  )
}
