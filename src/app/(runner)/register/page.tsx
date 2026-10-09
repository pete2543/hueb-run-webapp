import type { Metadata } from "next"
import { Suspense } from "react"
import { getDistances } from "@/features/registration/api"
import {
  DistancePicker,
  DistancePickerSkeleton,
} from "@/features/registration/components/distance-picker"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "เลือกระยะ" }

const header = (
  <StepHeader
    current={1}
    backHref="/"
    title="เลือกระยะที่ใช่สำหรับคุณ"
    description="เลือกระยะวิ่งเพื่อเริ่มสมัคร"
  />
)

export default function DistancesPage() {
  return (
    <main>
      {/* โควตาคงเหลือต้องสดทุกครั้ง จึงโหลดใน Suspense ไม่ cache */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-5">
            {header}
            <DistancePickerSkeleton />
          </div>
        }
      >
        <DistanceList />
      </Suspense>
    </main>
  )
}

async function DistanceList() {
  const distances = await getDistances()
  return <DistancePicker distances={distances} header={header} />
}
