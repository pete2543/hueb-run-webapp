import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "Audit log" }

export default function AuditPage() {
  return <PagePlaceholder title="Audit log" design="Audit.dc.html" />
}
