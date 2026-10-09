"use client"

import { CalendarDays } from "lucide-react"
import { useId, useState } from "react"
import { th } from "react-day-picker/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/use-media-query"
import { formatThaiDate } from "@/lib/format"
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

export type Option<T extends string | number> = { value: T; label: string }

type SelectFieldProps<T extends string | number> = {
  label: string
  value: T | undefined | null
  onChange: (value: T | undefined) => void
  onBlur?: () => void
  options: Option<T>[]
  error?: string
  placeholder?: string
  disabled?: boolean
  /** ใช้กับ Controller ของ react-hook-form (field.ref) ให้โฟกัสได้เมื่อมี error */
  ref?: React.Ref<HTMLButtonElement>
  className?: string
}

/** Dropdown ของ shadcn/ui (Base UI) ใช้กับ <Controller> */
export function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  placeholder = "เลือก",
  disabled,
  ref,
  className,
}: SelectFieldProps<T>) {
  const id = useId()
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Select<T>
        items={options}
        value={value ?? null}
        onValueChange={(next) => onChange(next ?? undefined)}
        // นับว่า "แตะแล้ว" ตอนปิดรายการ ไม่ใช่ตอนโฟกัสย้ายเข้าไปในรายการ (กัน error ขึ้นระหว่างเลือก)
        onOpenChange={(next) => {
          if (!next) onBlur?.()
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            controlClass,
            "w-full justify-between gap-2 rounded-xl bg-white pr-3 data-placeholder:text-muted-foreground/80 data-popup-open:border-primary data-popup-open:ring-3 data-popup-open:ring-primary/20 data-[size=default]:h-11 [&>svg]:size-5 [&>svg]:text-muted-foreground",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="max-h-72 rounded-xl p-1 shadow-lg ring-border"
          alignItemWithTrigger={false}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-11 rounded-lg px-3 pr-9 text-base data-highlighted:bg-muted data-selected:font-semibold data-selected:text-primary [&_svg]:size-4 [&_svg]:text-primary"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

/** "YYYY-MM-DD" ↔ Date (เวลาท้องถิ่น ไม่เพี้ยนวันจาก timezone) */
function parseIsoDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** ปี พ.ศ. ใน dropdown และหัวปฏิทิน */
const calendarFormatters = {
  formatYearDropdown: (date: Date) => String(date.getFullYear() + 543),
  formatMonthDropdown: (date: Date) => date.toLocaleString("th-TH", { month: "short" }),
  formatCaption: (date: Date) => date.toLocaleString("th-TH", { month: "long", year: "numeric" }),
}

type DateFieldProps = {
  label: string
  value: string | undefined
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  min: Date
  max: Date
  /** เดือนที่เปิดปฏิทินครั้งแรกเมื่อยังไม่ได้เลือก */
  defaultMonth?: Date
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * เลือกวันที่ (shadcn Calendar) แสดงผลเป็นภาษาไทย ปี พ.ศ.
 * คอม: ปฏิทินลอย (Popover) · มือถือ: แผ่นเลื่อนขึ้นจากด้านล่าง (Drawer) ปุ่มวันใหญ่ 44px
 * มี dropdown เดือน/ปี เลือกปีเกิดได้ในครั้งเดียวไม่ต้องกดย้อนทีละเดือน
 */
export function DateField({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "เลือกวันที่",
  min,
  max,
  defaultMonth,
  ref,
}: DateFieldProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const desktop = useMediaQuery("(min-width: 640px)")
  const selected = parseIsoDate(value)

  // นับว่า "แตะแล้ว" ตอนปิดปฏิทิน ไม่ใช่ตอนโฟกัสย้ายเข้าไปในปฏิทิน
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) onBlur?.()
  }

  const triggerProps = {
    id,
    ref,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: cn(
      controlClass,
      "flex items-center justify-between gap-2 pr-3 text-left data-popup-open:border-primary data-popup-open:ring-3 data-popup-open:ring-primary/20",
    ),
    children: (
      <>
        <span className={cn("truncate", !selected && "text-muted-foreground/80")}>
          {selected ? formatThaiDate(toIsoDate(selected)) : placeholder}
        </span>
        <CalendarDays className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </>
    ),
  }

  const calendar = (
    <Calendar
      mode="single"
      locale={th}
      captionLayout="dropdown"
      formatters={calendarFormatters}
      selected={selected}
      defaultMonth={selected ?? defaultMonth}
      startMonth={min}
      endMonth={max}
      disabled={{ before: min, after: max }}
      onSelect={(date) => {
        if (!date) return
        onChange(toIsoDate(date))
        handleOpenChange(false)
      }}
      className="mx-auto bg-transparent p-0"
      style={{ "--cell-size": desktop ? "2.5rem" : "2.75rem" } as React.CSSProperties}
    />
  )

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {desktop ? (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger {...triggerProps} />
          <PopoverContent align="start" className="w-auto rounded-2xl p-3 shadow-xl ring-border">
            {calendar}
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger {...triggerProps} />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-lg font-semibold">{label}</DrawerTitle>
              <DrawerDescription>เลือกเดือนและปี (พ.ศ.) ด้านบน แล้วแตะวันที่</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-3">{calendar}</div>
            <DrawerFooter className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              <DrawerClose className="flex min-h-12 items-center justify-center rounded-xl border bg-white font-semibold">
                ปิด
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
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
