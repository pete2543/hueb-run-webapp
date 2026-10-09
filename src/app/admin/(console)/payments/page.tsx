import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/payments"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function PaymentsPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Admin.dc.html"
        items={["คิวสลิปรอตรวจ", "ผลตรวจอัตโนมัติ", "อนุมัติ / ปฏิเสธพร้อมเหตุผล"]}
      />
    </>
  )
}
