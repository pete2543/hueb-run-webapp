import { cn } from "@/lib/utils"
import { registrationSteps, type RegistrationStep } from "../steps"

export function StepHeader({ current }: { current: RegistrationStep }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        ขั้นตอนที่ {current} จาก {registrationSteps.length}
      </p>
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
