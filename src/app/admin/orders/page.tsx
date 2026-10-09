import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "ใบสมัคร" }

export default function OrdersPage() {
  return <PagePlaceholder title="ใบสมัคร" design="Orders.dc.html" />
}
