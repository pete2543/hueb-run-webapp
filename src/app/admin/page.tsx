import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "แดชบอร์ด" }

export default function AdminDashboardPage() {
  return <PagePlaceholder title="แดชบอร์ด" design="Dashboard.dc.html" />
}
