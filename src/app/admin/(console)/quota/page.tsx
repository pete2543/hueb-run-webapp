import type { Metadata } from "next"
import { AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/quota"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function QuotaPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <ComingSoon
        design="Quota.dc.html"
        items={["ราคา & early bird", "โควตาแต่ละระยะ", "สต็อกเสื้อ", "เวลาเปิด/ปิดรับ"]}
      />
    </>
  )
}
