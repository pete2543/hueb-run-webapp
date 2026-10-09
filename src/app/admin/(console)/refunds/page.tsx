import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/refunds"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function RefundsPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Refunds.dc.html"
        items={["คำขอคืนเงิน", "อนุมัติ / ปฏิเสธ", "ยืนยันโอนคืน"]}
      />
    </>
  )
}
