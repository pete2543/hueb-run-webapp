import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/runners"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function RunnersPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="AdminRunners.dc.html"
        items={["รายชื่อนักวิ่ง", "สรุปไซซ์เสื้อ", "สถานะเช็กอิน"]}
      />
    </>
  )
}
