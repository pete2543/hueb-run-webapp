import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "ข้อมูลนักวิ่ง" }

export default function RunnersPage() {
  return (
    <main className="flex flex-col gap-6">
      <StepHeader current={2} />
      <PagePlaceholder title="ข้อมูลนักวิ่ง" design="Runners.dc.html" />
    </main>
  )
}
