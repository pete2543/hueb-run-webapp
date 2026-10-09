import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/audit"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function AuditPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Audit.dc.html"
        items={["ใคร ทำอะไร เมื่อไหร่", "ค่าเก่า / ค่าใหม่", "กรองตามผู้ใช้และวันที่"]}
      />
    </>
  )
}
