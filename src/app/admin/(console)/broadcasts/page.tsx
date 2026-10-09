import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/broadcasts"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function BroadcastsPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Broadcast.dc.html"
        items={["เขียนประกาศ", "เลือกกลุ่มผู้รับ", "ตั้งเวลาส่ง", "โควต้าข้อความ"]}
      />
    </>
  )
}
