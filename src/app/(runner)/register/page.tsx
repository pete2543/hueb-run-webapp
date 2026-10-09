import type { Metadata } from "next"
import { Suspense } from "react"
import { getDistances } from "@/features/registration/api"
import {
  DistancePicker,
  DistancePickerSkeleton,
} from "@/features/registration/components/distance-picker"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "เลือกระยะ" }

export default function DistancesPage() {
  return (
    <main className="flex flex-col gap-5">
      <StepHeader current={1} backHref="/" />
      {/* โควตาคงเหลือต้องสดทุกครั้ง จึงโหลดใน Suspense ไม่ cache */}
      <Suspense fallback={<DistancePickerSkeleton />}>
        <DistanceList />
      </Suspense>
    </main>
  )
}

async function DistanceList() {
  const distances = await getDistances()
  return <DistancePicker distances={distances} />
}
