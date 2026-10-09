import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/promos"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function PromosPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon design="Promo.dc.html" items={["รายการโค้ด", "สร้างโค้ดใหม่", "จำนวนที่ใช้ไป"]} />
    </>
  )
}
