import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "ตรวจสลิป" }

export default function PaymentsPage() {
  return <PagePlaceholder title="ตรวจสลิป" design="Admin.dc.html" />
}
