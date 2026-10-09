import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/orders"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function OrdersPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Orders.dc.html"
        items={["ค้นหาชื่อ/เบอร์/เลขใบสมัคร", "กรองตามสถานะ", "ส่งออก Excel"]}
      />
    </>
  )
}
