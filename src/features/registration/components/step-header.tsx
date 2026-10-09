import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { registrationSteps, type RegistrationStep } from "../steps"

export function StepHeader({ current, backHref }: { current: RegistrationStep; backHref: string }) {
  const title = registrationSteps[current - 1].label

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="ย้อนกลับ"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-card hover:bg-muted"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">
            ขั้นตอนที่ {current} จาก {registrationSteps.length}
          </p>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
      <ol className="flex gap-1.5" aria-label="ขั้นตอนการสมัคร">
        {registrationSteps.map(({ step, label }) => (
          <li
            key={step}
            aria-current={step === current ? "step" : undefined}
            className={cn("h-1 flex-1 rounded-full", step <= current ? "bg-primary" : "bg-border")}
          >
            <span className="sr-only">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
