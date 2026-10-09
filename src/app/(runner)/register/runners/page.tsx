import type { Metadata } from "next"
import { Suspense } from "react"
import { getDistances, getLookups, getShirtSizes } from "@/features/registration/api"
import { RunnersStep } from "@/features/registration/components/runners-form"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "ข้อมูลนักวิ่ง" }

export default function RunnersPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <StepHeader current={2} backHref="/register" />
      <Suspense fallback={<div className="h-[36rem] animate-pulse rounded-2xl bg-muted" />}>
        <RunnersData />
      </Suspense>
    </main>
  )
}

async function RunnersData() {
  const [distances, shirtSizes, lookups] = await Promise.all([
    getDistances(),
    getShirtSizes(),
    getLookups(),
  ])
  return <RunnersStep distances={distances} shirtSizes={shirtSizes} lookups={lookups} />
}
