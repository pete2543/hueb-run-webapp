"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2, Pencil, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { Controller, useForm, useWatch, type DefaultValues, type Resolver } from "react-hook-form"
import { Mascot } from "@/components/mascot"
import { formatBaht } from "@/lib/format"
import { cn } from "@/lib/utils"
import waiImage from "@/assets/brand/mascot-wai.webp"
import { createOrder, lookupZip, validatePromo } from "../actions"
import { getDraft, setDraft, useDraftReady } from "../draft-store"
import {
  runnersStepSchema,
  summaryStepSchema,
  type RunnersStepValues,
  type ShippingAddressValues,
  type SummaryStepValues,
} from "../schema"
import type { Distance, PromoResult, ShippingOption, ShirtSize, ZipMatch } from "../types"
import { SelectField, TextField } from "./form-fields"

type Options = {
  distances: Distance[]
  shirtSizes: ShirtSize[]
  shippingOptions: ShippingOption[]
}

const toNumber = (v: unknown) => (v === "" || v == null ? undefined : Number(v))
const loadAlert = () => import("@/lib/alert")

export function SummaryStep(props: Options) {
  const ready = useDraftReady()
  if (!ready) return <div className="h-[40rem] animate-pulse rounded-2xl bg-muted" />

  const draft = getDraft()
  // ต้องผ่านขั้นตอนที่ 2 ครบก่อน (เช่น เปิดลิงก์นี้ตรง ๆ หรือ session หมด)
  const step2 = runnersStepSchema.safeParse({
    runners: draft.runners,
    acceptedPdpa: draft.acceptedPdpa,
  })
  if (!step2.success) return <MissingRunners />

  return <SummaryForm {...props} step2={step2.data} initial={draft.summary ?? {}} />
}

function MissingRunners() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center">
      <Mascot pose="pointing" sizes="140px" className="h-auto w-32" />
      <p className="font-heading text-lg font-semibold">ยังไม่มีข้อมูลนักวิ่ง</p>
      <p className="text-sm text-muted-foreground">
        กรอกข้อมูลนักวิ่งให้ครบก่อน แล้วค่อยมาสรุปรายการ
      </p>
      <Link
        href="/register/runners"
        className="flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground"
      >
        ไปกรอกข้อมูลนักวิ่ง
      </Link>
    </div>
  )
}

function SummaryForm({
  distances,
  shirtSizes,
  shippingOptions,
  step2,
  initial,
}: Options & { step2: RunnersStepValues; initial: Partial<SummaryStepValues> }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { runners } = step2
  const first = runners[0]

  const form = useForm<SummaryStepValues>({
    resolver: zodResolver(summaryStepSchema) as unknown as Resolver<SummaryStepValues>,
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      contact: {
        name: `${first.firstName} ${first.lastName}`,
        phone: first.phone,
        email: "",
        ...initial.contact,
      },
      shippingOptionId: initial.shippingOptionId,
      needsAddress: initial.needsAddress ?? false,
      shippingAddress: {
        name: `${first.firstName} ${first.lastName}`,
        phone: first.phone,
        line1: "",
        postalCode: "",
        ...initial.shippingAddress,
      },
      promoCode: initial.promoCode ?? "",
    } as DefaultValues<SummaryStepValues>,
  })
  const {
    control,
    register,
    handleSubmit,
    setValue,
    subscribe,
    formState: { errors, isSubmitting, isSubmitSuccessful, submitCount },
  } = form

  // บันทึกที่กรอกไว้ทุกครั้งที่แก้
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => setDraft({ ...getDraft(), summary: values }),
      }),
    [subscribe],
  )

  // โฟกัสช่องแรกที่ผิดตามลำดับบนจอ หลังกดส่งแล้วไม่ผ่าน
  useEffect(() => {
    if (submitCount === 0 || isSubmitSuccessful) return
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!invalid) return
    const target =
      invalid instanceof HTMLFieldSetElement
        ? invalid.querySelector<HTMLElement>("input:not(:disabled)")
        : invalid
    invalid.scrollIntoView({ block: "center" })
    target?.focus({ preventScroll: true })
  }, [submitCount, isSubmitSuccessful])

  // ---------- ราคา ----------
  const priced = runners.map((r) => ({
    runner: r,
    distance: distances.find((d) => d.id === r.distanceId),
    size: shirtSizes.find((s) => s.id === r.shirtSizeId),
  }))
  const subtotal = priced.reduce((sum, p) => sum + (p.distance?.price ?? 0), 0)
  const shippingOptionId = useWatch({ control, name: "shippingOptionId" })
  const shipping = shippingOptions.find((o) => o.id === shippingOptionId)
  const needsAddress = shipping?.type === "Post"

  // ---------- โค้ดส่วนลด ----------
  const [promo, setPromo] = useState<PromoResult | null>(null)
  const [promoInput, setPromoInput] = useState(initial.promoCode ?? "")
  const [promoError, setPromoError] = useState<string>()
  const [checkingPromo, startPromo] = useTransition()
  const distanceIds = runners.map((r) => r.distanceId)

  function applyPromo(code: string) {
    startPromo(async () => {
      const result = await validatePromo(code, distanceIds)
      if (result.ok) {
        setPromo(result.data)
        setPromoInput(result.data.code)
        setPromoError(undefined)
        setValue("promoCode", result.data.code)
      } else {
        setPromo(null)
        setPromoError(result.message)
        setValue("promoCode", "")
      }
    })
  }

  function clearPromo() {
    setPromo(null)
    setPromoInput("")
    setPromoError(undefined)
    setValue("promoCode", "")
  }

  // โค้ดที่ใช้ไว้ก่อนรีเฟรช ตรวจซ้ำอีกครั้ง (ส่วนลดอาจเปลี่ยน/หมดแล้ว)
  const initialPromo = useRef(initial.promoCode)
  useEffect(() => {
    if (initialPromo.current) applyPromo(initialPromo.current)
    // ทำครั้งเดียวตอนเปิดหน้า
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const discount = promo?.discount ?? 0
  const fee = shipping?.fee ?? 0
  const total = subtotal - discount + fee

  // ---------- ส่งออเดอร์ ----------
  const onValid = async (values: SummaryStepValues) => {
    const result = await createOrder({
      contact: values.contact,
      runners,
      shippingOptionId: values.shippingOptionId,
      shippingAddress: values.needsAddress
        ? (values.shippingAddress as ShippingAddressValues)
        : null,
      promoCode: values.promoCode,
      acceptedPdpa: true,
    })
    if (result.ok) {
      router.push(`/register/payment/${result.data.orderId}`)
      return
    }

    const { alert } = await loadAlert()
    const backToRunners = result.code === "QUOTA_FULL" || result.code === "SHIRT_OUT_OF_STOCK"
    if (result.code.startsWith("PROMO_")) clearPromo()
    const { isConfirmed } = await alert.fire({
      imageUrl: waiImage.src,
      imageWidth: 120,
      imageAlt: "น้องกระต่ายไหว้ขออภัย",
      title: "ขออภัย สมัครไม่สำเร็จ",
      text: backToRunners
        ? `${result.message} กรุณาเปลี่ยนในข้อมูลนักวิ่ง`
        : result.code.startsWith("PROMO_")
          ? `${result.message} ระบบเอาโค้ดออกให้แล้ว กดไปชำระเงินอีกครั้งได้เลย`
          : result.message,
      confirmButtonText: backToRunners ? "แก้ข้อมูลนักวิ่ง" : "ตกลง",
    })
    if (backToRunners && isConfirmed) router.push("/register/runners")
  }

  const onInvalid = async () => {
    const { toast } = await loadAlert()
    toast.fire({ icon: "error", title: "กรอกข้อมูลให้ครบก่อนไปชำระเงิน" })
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className="flex flex-col gap-5"
    >
      {/* ---------- รายการนักวิ่ง ---------- */}
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>นักวิ่ง {runners.length} คน</CardTitle>
          <Link
            href="/register/runners"
            className="flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-primary"
          >
            <Pencil className="size-4" aria-hidden />
            แก้ไข
          </Link>
        </div>
        <ul className="flex flex-col divide-y">
          {priced.map(({ runner, distance, size }, i) => (
            <li key={i} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted font-heading font-bold text-primary">
                {distance?.distanceKm}K
              </span>
              <span className="min-w-0 grow">
                <span className="block truncate font-semibold">
                  {runner.firstName} {runner.lastName}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {distance?.name} · เสื้อ {size?.size}
                </span>
              </span>
              <span className="font-heading font-semibold">{formatBaht(distance?.price ?? 0)}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ---------- ผู้ติดต่อ ---------- */}
      <Card>
        <CardTitle>ผู้ติดต่อของใบสมัคร</CardTitle>
        <TextField
          label="ชื่อ-นามสกุล"
          autoComplete="name"
          error={errors.contact?.name?.message}
          {...register("contact.name")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="เบอร์โทร"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.contact?.phone?.message}
            {...register("contact.phone")}
          />
          <TextField
            label="อีเมล (ไม่บังคับ)"
            type="email"
            autoComplete="email"
            hint="ส่งใบยืนยันทางอีเมลด้วย ถ้าไม่ได้ใช้ LINE"
            error={errors.contact?.email?.message}
            {...register("contact.email")}
          />
        </div>
      </Card>

      {/* ---------- โค้ดส่วนลด ---------- */}
      <Card>
        <CardTitle>โค้ดส่วนลด</CardTitle>
        {promo ? (
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3" aria-live="polite">
            <Check className="size-5 shrink-0 text-primary" aria-hidden />
            <p className="grow text-sm">
              ใช้โค้ด <strong>{promo.code}</strong> แล้ว {promo.label}
              {promo.label.includes("฿") ? null : ` (${formatBaht(promo.discount)})`}
            </p>
            <button
              type="button"
              onClick={clearPromo}
              aria-label="เอาโค้ดออก"
              className="flex size-11 items-center justify-center rounded-full hover:bg-white"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    applyPromo(promoInput)
                  }
                }}
                aria-label="โค้ดส่วนลด"
                aria-invalid={promoError ? true : undefined}
                placeholder="กรอกโค้ด"
                autoCapitalize="characters"
                className="h-11 min-w-0 grow rounded-xl border bg-white px-3.5 uppercase outline-none placeholder:normal-case focus:border-primary focus:ring-3 focus:ring-primary/20 aria-invalid:border-destructive"
              />
              <button
                type="button"
                onClick={() => applyPromo(promoInput)}
                disabled={checkingPromo || !promoInput.trim()}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-foreground px-5 font-semibold text-background disabled:opacity-40"
              >
                {checkingPromo ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                ใช้โค้ด
              </button>
            </div>
            {promoError ? (
              <p className="text-sm text-destructive" aria-live="polite">
                {promoError}
              </p>
            ) : null}
          </div>
        )}
      </Card>

      {/* ---------- วิธีรับของ ---------- */}
      <Card>
        <Controller
          control={control}
          name="shippingOptionId"
          render={({ field }) => (
            <fieldset
              className="flex flex-col gap-3"
              aria-invalid={errors.shippingOptionId ? true : undefined}
            >
              <legend className="mb-3 font-heading font-semibold">วิธีรับของ</legend>
              {shippingOptions.map((option, i) => {
                const checked = field.value === option.id
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-4 transition",
                      "has-focus-visible:ring-3 has-focus-visible:ring-primary/30",
                      checked ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
                    )}
                  >
                    <input
                      ref={i === 0 ? field.ref : undefined}
                      type="radio"
                      name={field.name}
                      checked={checked}
                      onChange={() => {
                        field.onChange(option.id)
                        setValue("needsAddress", option.type === "Post")
                      }}
                      onBlur={field.onBlur}
                      className="size-5 shrink-0 accent-primary"
                    />
                    <span className="grow">
                      <span className="block font-semibold">{option.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                    <span className="font-heading font-semibold">
                      {option.fee ? `+${formatBaht(option.fee)}` : "ฟรี"}
                    </span>
                  </label>
                )
              })}
              {errors.shippingOptionId ? (
                <p className="text-sm text-destructive">{errors.shippingOptionId.message}</p>
              ) : null}
            </fieldset>
          )}
        />
      </Card>

      {needsAddress ? <AddressCard form={form} /> : null}

      {/* ---------- ยอดรวม ---------- */}
      <Card>
        <dl className="flex flex-col gap-2 text-sm" aria-live="polite">
          <Row label={`ค่าสมัคร (${runners.length} คน)`} value={formatBaht(subtotal)} />
          {promo ? (
            <Row
              label={`ส่วนลด ${promo.code}`}
              value={`−${formatBaht(discount)}`}
              className="text-primary"
            />
          ) : null}
          <Row
            label="ค่าจัดส่ง"
            value={shipping ? (fee ? formatBaht(fee) : "ฟรี") : "ยังไม่เลือก"}
          />
          <div className="mt-2 flex items-baseline justify-between border-t pt-3">
            <dt className="font-heading text-lg font-semibold">ยอดรวม</dt>
            <dd className="font-heading text-2xl font-bold">{formatBaht(total)}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
          {isSubmitting ? "กำลังจองที่ให้…" : "ไปชำระเงิน"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          ระบบจะจองที่ไว้ให้ 30 นาทีหลังกดไปชำระเงิน ยอดที่ต้องโอนจะมีเศษสตางค์ไว้จับคู่ใบสมัคร
        </p>
      </div>
    </form>
  )
}

/** ที่อยู่จัดส่ง: กรอกรหัสไปรษณีย์แล้วเติมจังหวัด/อำเภอให้ เลือกตำบลจากรายการ */
function AddressCard({ form }: { form: ReturnType<typeof useForm<SummaryStepValues>> }) {
  const {
    register,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = form
  const e = errors.shippingAddress
  const [matches, setMatches] = useState<ZipMatch[] | null>(null)
  const [district, setDistrict] = useState<string>()
  const [zipError, setZipError] = useState<string>()
  const [looking, startLookup] = useTransition()
  const subdistrictId = useWatch({ control, name: "shippingAddress.subdistrictId" })

  function onZipChange(zip: string) {
    if (/^\d{5}$/.test(zip)) {
      lookup(zip)
    } else {
      setMatches(null)
      setZipError(undefined)
    }
  }

  function lookup(zip: string) {
    startLookup(async () => {
      const result = await lookupZip(zip)
      const list = result.ok ? result.data : []
      setMatches(list)
      setZipError(
        result.ok
          ? list.length
            ? undefined
            : "ไม่พบรหัสไปรษณีย์นี้ ตรวจอีกครั้ง"
          : result.message,
      )
      const current = list.find(
        (m) => m.subdistrictId === getValues("shippingAddress.subdistrictId"),
      )
      const districts = [...new Set(list.map((m) => m.district))]
      setDistrict(current?.district ?? (districts.length === 1 ? districts[0] : undefined))
      if (!current) {
        setValue(
          "shippingAddress.subdistrictId",
          list.length === 1 ? list[0].subdistrictId : undefined!,
        )
      }
    })
  }

  // รหัสไปรษณีย์ที่กรอกไว้ก่อนรีเฟรช ดึงรายการตำบลกลับมา
  useEffect(() => {
    const zip = getValues("shippingAddress.postalCode")
    if (/^\d{5}$/.test(zip ?? "")) lookup(zip!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const districts = [...new Set((matches ?? []).map((m) => m.district))]
  const subdistricts = (matches ?? []).filter((m) => !district || m.district === district)
  const selected = matches?.find((m) => m.subdistrictId === subdistrictId)

  return (
    <Card>
      <CardTitle>ที่อยู่จัดส่ง</CardTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="ชื่อผู้รับ"
          autoComplete="shipping name"
          error={e?.name?.message}
          {...register("shippingAddress.name")}
        />
        <TextField
          label="เบอร์โทร"
          type="tel"
          inputMode="tel"
          autoComplete="shipping tel"
          error={e?.phone?.message}
          {...register("shippingAddress.phone")}
        />
      </div>
      <TextField
        label="ที่อยู่ (บ้านเลขที่ ซอย ถนน หมู่บ้าน)"
        autoComplete="shipping address-line1"
        error={e?.line1?.message}
        {...register("shippingAddress.line1")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="รหัสไปรษณีย์"
          inputMode="numeric"
          maxLength={5}
          placeholder="5 หลัก"
          autoComplete="shipping postal-code"
          hint={looking ? "กำลังค้นหา…" : "กรอกแล้วระบบเติมจังหวัด อำเภอ ตำบลให้"}
          error={e?.postalCode?.message ?? zipError}
          {...register("shippingAddress.postalCode", {
            onChange: (event) => onZipChange(event.target.value),
          })}
        />
        <ReadOnlyField label="จังหวัด" value={selected?.province ?? matches?.[0]?.province} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {districts.length > 1 ? (
          <SelectField
            label="อำเภอ/เขต"
            value={district ?? ""}
            onChange={(event) => {
              setDistrict(event.target.value || undefined)
              setValue("shippingAddress.subdistrictId", undefined!)
            }}
            options={districts.map((d) => ({ value: d, label: d }))}
          />
        ) : (
          <ReadOnlyField label="อำเภอ/เขต" value={district} />
        )}
        <SelectField
          label="ตำบล/แขวง"
          disabled={!subdistricts.length}
          options={subdistricts.map((m) => ({ value: m.subdistrictId, label: m.subdistrict }))}
          error={e?.subdistrictId?.message}
          {...register("shippingAddress.subdistrictId", { setValueAs: toNumber })}
        />
      </div>
    </Card>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex h-11 items-center rounded-xl border bg-muted px-3.5 text-muted-foreground">
        {value ?? "—"}
      </span>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm shadow-primary/5 sm:p-5">
      {children}
    </section>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-lg font-semibold">{children}</h2>
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-4", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
