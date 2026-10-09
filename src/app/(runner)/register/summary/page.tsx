import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "สรุปรายการ" }

export default function SummaryPage() {
  return (
    <main className="flex flex-col gap-6">
      <StepHeader current={3} />
      <PagePlaceholder title="สรุปรายการ" design="Summary.dc.html" />
    </main>
  )
}
