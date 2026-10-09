import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "เช็กอิน / รับของ" }

export default function CheckinPage() {
  return <PagePlaceholder title="เช็กอิน / รับของ" design="Checkin.dc.html" />
}
