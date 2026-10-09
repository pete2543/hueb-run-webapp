import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/checkin"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function CheckinPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Checkin.dc.html"
        items={["สแกน QR", "ค้นหาเลขบิบ/ชื่อ/เบอร์", "ยกเลิกย้อนหลัง"]}
      />
    </>
  )
}
