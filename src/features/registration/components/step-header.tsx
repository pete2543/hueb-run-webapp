import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { registrationSteps, type RegistrationStep } from "../steps"

export function StepHeader({
  current,
  backHref,
  title,
  description,
  className,
}: {
  current: RegistrationStep
  backHref: string
  /** ค่าเริ่มต้นคือชื่อขั้นตอน */
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="group flex min-h-11 items-center gap-2 pr-2 text-sm font-semibold text-primary"
        >
          <span className="flex size-10 items-center justify-center rounded-full border bg-white transition group-hover:border-primary/40">
            <ChevronLeft className="size-5" aria-hidden />
          </span>
          ย้อนกลับ
        </Link>
        <p className="text-sm text-muted-foreground">
          ขั้นตอนที่ {current} จาก {registrationSteps.length}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl">
          {title ?? registrationSteps[current - 1].label}
        </h1>
        {description ? <p className="text-muted-foreground lg:text-lg">{description}</p> : null}
      </div>
      <ol className="flex gap-1.5" aria-label="ขั้นตอนการสมัคร">
        {registrationSteps.map(({ step, label }) => (
          <li
            key={step}
            aria-current={step === current ? "step" : undefined}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step <= current ? "bg-primary" : "bg-border",
            )}
          >
            <span className="sr-only">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
