import type { Metadata } from "next"
import { Suspense } from "react"
import { getDistances, getShippingOptions, getShirtSizes } from "@/features/registration/api"
import { StepHeader } from "@/features/registration/components/step-header"
import { SummaryStep } from "@/features/registration/components/summary-form"

export const metadata: Metadata = { title: "สรุปรายการ" }

export default function SummaryPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <StepHeader current={3} backHref="/register/runners" />
      <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-2xl bg-muted" />}>
        <SummaryData />
      </Suspense>
    </main>
  )
}

async function SummaryData() {
  const [distances, shirtSizes, shippingOptions] = await Promise.all([
    getDistances(),
    getShirtSizes(),
    getShippingOptions(),
  ])
  return (
    <SummaryStep distances={distances} shirtSizes={shirtSizes} shippingOptions={shippingOptions} />
  )
}
