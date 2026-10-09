import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "เลือกระยะ" }

export default function DistancesPage() {
  return (
    <main className="flex flex-col gap-6">
      <StepHeader current={1} />
      <PagePlaceholder title="เลือกระยะ" design="Distances.dc.html" />
    </main>
  )
}
