import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "โปรโมชัน" }

export default function PromosPage() {
  return <PagePlaceholder title="โปรโมชัน" design="Promo.dc.html" />
}
