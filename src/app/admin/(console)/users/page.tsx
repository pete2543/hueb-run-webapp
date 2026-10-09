import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/users"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function UsersPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon design="Users.dc.html" items={["บัญชีผู้ใช้", "บทบาท", "งานที่เข้าถึงได้"]} />
    </>
  )
}
