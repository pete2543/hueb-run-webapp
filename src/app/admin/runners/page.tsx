import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "นักวิ่ง & เลขบิบ" }

export default function AdminRunnersPage() {
  return <PagePlaceholder title="นักวิ่ง & เลขบิบ" design="AdminRunners.dc.html" />
}
