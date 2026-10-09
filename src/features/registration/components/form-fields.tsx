"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * ช่องกรอกของฟอร์มสมัคร สูงอย่างน้อย 44px (ใช้บนมือถือ)
 * ใช้กับ react-hook-form: <TextField {...register("x")} error={errors.x?.message} />
 */

const controlClass =
  "h-11 w-full rounded-xl border bg-white px-3.5 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/20 aria-invalid:border-destructive aria-invalid:ring-destructive/15"

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}

type TextFieldProps = React.ComponentProps<"input"> & {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, className, ...props }: TextFieldProps) {
  const id = useId()
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={controlClass}
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

type SelectFieldProps = React.ComponentProps<"select"> & {
  label: string
  error?: string
  options: { value: number | string; label: string }[]
}

export function SelectField({ label, error, options, className, ...props }: SelectFieldProps) {
  const id = useId()
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          controlClass,
          "appearance-none bg-[url(/chevron-down.svg)] bg-size-[18px] bg-position-[right_0.8rem_center] bg-no-repeat pr-9",
        )}
        {...props}
      >
        <option value="">เลือก</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

export type Choice<T extends string | number> = {
  value: T
  label: React.ReactNode
  disabled?: boolean
}

/** ปุ่มเลือกแบบกลุ่ม (radio) เช่น เพศ ไซซ์เสื้อ ระยะ */
export function ChoiceGroup<T extends string | number>({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  hint,
  inputRef,
  columns,
}: {
  label: string
  name: string
  value: T | undefined
  onChange: (value: T) => void
  onBlur?: () => void
  options: Choice<T>[]
  error?: string
  hint?: React.ReactNode
  /** ref ของปุ่มแรก ให้ react-hook-form โฟกัสเมื่อมี error */
  inputRef?: React.Ref<HTMLInputElement>
  columns?: string
}) {
  const id = useId()
  return (
    <fieldset
      className="flex min-w-0 flex-col gap-1.5"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className={cn("grid gap-2", columns ?? "grid-cols-3")}>
        {options.map((option, i) => {
          const checked = option.value === value
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border bg-white px-2 text-center text-sm font-medium transition",
                "has-focus-visible:ring-3 has-focus-visible:ring-primary/30",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50",
                option.disabled && "cursor-not-allowed opacity-45 hover:border-border",
                error && !checked && "border-destructive/60",
              )}
            >
              <input
                ref={i === 0 ? inputRef : undefined}
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                className="sr-only"
              />
              {option.label}
            </label>
          )
        })}
      </div>
      {hint && !error ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      <ErrorText id={`${id}-error`} message={error} />
    </fieldset>
  )
}
