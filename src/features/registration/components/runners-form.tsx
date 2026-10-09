"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type DefaultValues,
} from "react-hook-form"
import { formatBaht } from "@/lib/format"
import { cn } from "@/lib/utils"
import { getDraft, setDraft, useDraftReady, type RegistrationDraft } from "../draft-store"
import {
  emptyRunner,
  genders,
  maxRunnersPerOrder,
  runnersStepSchema,
  type RunnersStepValues,
} from "../schema"
import type { Distance, Lookups, ShirtSize } from "../types"
import { ChoiceGroup, SelectField, TextField } from "./form-fields"

type Options = {
  distances: Distance[]
  shirtSizes: ShirtSize[]
  lookups: Lookups
}

/** แปลงค่าจาก <select> ("" = ยังไม่เลือก) เป็นตัวเลข */
const toNumber = (v: unknown) => (v === "" || v == null ? undefined : Number(v))

/** SweetAlert2 โหลดเมื่อจะใช้เท่านั้น ให้หน้าสมัครเบา */
const loadAlert = () => import("@/lib/alert")

export function RunnersStep(props: Options) {
  // รอให้อ่าน draft จาก sessionStorage ได้ก่อน ฟอร์มจะได้เริ่มจากค่าที่กรอกค้างไว้
  const ready = useDraftReady()
  if (!ready) return <RunnersFormSkeleton />
  return <RunnersForm {...props} initial={getDraft()} />
}

function RunnersForm({ initial, ...options }: Options & { initial: RegistrationDraft }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const form = useForm<RunnersStepValues>({
    resolver: zodResolver(runnersStepSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      runners: initial.runners.length ? initial.runners : [emptyRunner()],
      acceptedPdpa: initial.acceptedPdpa ?? false,
    } as DefaultValues<RunnersStepValues>,
  })
  const {
    control,
    register,
    handleSubmit,
    subscribe,
    formState: { errors, isSubmitting, isSubmitSuccessful, submitCount },
  } = form
  const { fields, append, remove } = useFieldArray({ control, name: "runners" })

  // บันทึกที่กรอกไว้ทุกครั้งที่แก้ รีเฟรชหรือย้อนกลับมาแล้วไม่ต้องกรอกใหม่
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => {
          setDraft({
            runners: values.runners as RegistrationDraft["runners"],
            acceptedPdpa: values.acceptedPdpa,
          })
        },
      }),
    [subscribe],
  )

  const runners = useWatch({ control, name: "runners" })
  const total = (runners ?? []).reduce((sum, r) => {
    const distance = options.distances.find((d) => d.id === r?.distanceId)
    return sum + (distance?.price ?? 0)
  }, 0)
  const canAdd = fields.length < maxRunnersPerOrder

  async function confirmRemove(index: number) {
    const name = runners?.[index]?.firstName?.trim()
    const { alert } = await loadAlert()
    const { isConfirmed } = await alert.fire({
      icon: "warning",
      title: `ลบนักวิ่ง ${index + 1}${name ? ` (${name})` : ""}?`,
      text: "ข้อมูลที่กรอกของคนนี้จะหายไป",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      reverseButtons: true,
    })
    if (isConfirmed) remove(index)
  }

  const onValid = (values: RunnersStepValues) => {
    setDraft({ runners: values.runners, acceptedPdpa: values.acceptedPdpa })
    router.push("/register/summary")
  }

  const onInvalid = async () => {
    const { toast } = await loadAlert()
    toast.fire({ icon: "error", title: "กรอกข้อมูลให้ครบก่อนไปต่อ" })
  }

  // หลังกดส่งแล้วไม่ผ่าน: โฟกัสช่องแรกที่ผิดตามลำดับบนจอ
  // (react-hook-form โฟกัสตามลำดับที่ register ซึ่งไม่ตรงกับบนจอ จึงปิด shouldFocusError ไว้)
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

  return (
    <FormProvider {...form}>
      <form
        noValidate
        ref={formRef}
        onSubmit={handleSubmit(onValid, onInvalid)}
        className="flex flex-col gap-5"
      >
        {fields.map((field, index) => (
          <RunnerCard
            key={field.id}
            index={index}
            onRemove={fields.length > 1 ? () => confirmRemove(index) : undefined}
            {...options}
          />
        ))}

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-muted/60 p-5 text-center">
          <p className="font-semibold">สมัครให้เพื่อนด้วยไหม?</p>
          <p className="text-sm text-muted-foreground">
            เพิ่มนักวิ่งหลายคนในใบสมัครเดียว จ่ายเงินครั้งเดียว (สูงสุด {maxRunnersPerOrder} คน)
          </p>
          <button
            type="button"
            disabled={!canAdd}
            onClick={() =>
              append(emptyRunner() as RunnersStepValues["runners"][number], {
                focusName: `runners.${fields.length}.titleId`,
              })
            }
            className="flex min-h-11 items-center gap-2 rounded-full border-2 border-primary bg-white px-5 font-semibold text-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
            เพิ่มนักวิ่งอีกคน
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4">
            <input
              type="checkbox"
              {...register("acceptedPdpa")}
              aria-invalid={errors.acceptedPdpa ? true : undefined}
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span className="text-sm">
              ยอมรับเงื่อนไขการสมัคร และยินยอมให้ผู้จัดเก็บและใช้ข้อมูลส่วนบุคคล รวมถึงข้อมูลสุขภาพ
              (กรุ๊ปเลือด โรคประจำตัว/แพ้ยา) เพื่อจัดงานและดูแลความปลอดภัย ตาม
              {/* TODO: ลิงก์ไปหน้าเงื่อนไขและนโยบายความเป็นส่วนตัวเมื่อมีเนื้อหาจริง */}
              <span className="font-semibold text-primary"> นโยบายความเป็นส่วนตัว (PDPA)</span>
            </span>
          </label>
          {errors.acceptedPdpa ? (
            <p className="text-sm text-destructive">{errors.acceptedPdpa.message}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-4 rounded-2xl border bg-muted p-4" aria-live="polite">
          <div className="grow">
            <p className="text-sm text-muted-foreground">ค่าสมัคร ({fields.length} คน)</p>
            <p className="text-xs text-muted-foreground">ยังไม่รวมส่วนลดและค่าจัดส่ง</p>
          </div>
          <p className="font-heading text-2xl font-semibold">{formatBaht(total)}</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          ถัดไป · สรุปรายการ
        </button>
      </form>
    </FormProvider>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 font-heading font-semibold text-primary">{children}</h3>
}

function RunnerCard({
  index,
  onRemove,
  distances,
  shirtSizes,
  lookups,
}: Options & { index: number; onRemove?: () => void }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RunnersStepValues>()
  const e = errors.runners?.[index]
  const name = `runners.${index}` as const
  const [firstName, distanceId, shirtSizeId] = useWatch({
    control,
    name: [`${name}.firstName`, `${name}.distanceId`, `${name}.shirtSizeId`],
  })
  const distance = distances.find((d) => d.id === distanceId)
  const size = shirtSizes.find((s) => s.id === shirtSizeId)
  // คนแรกมักเป็นคนกรอกเอง ให้เบราว์เซอร์เติมชื่อ/เบอร์ได้ คนอื่นปิดไว้กันเติมผิดคน
  const auto = (value: string) => (index === 0 ? value : "off")
  const today = new Date().toISOString().slice(0, 10)
  const headingId = `runner-${index}-heading`

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm shadow-primary/5 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
          <UserRound className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 grow">
          <h2 id={headingId} className="font-heading text-lg font-semibold">
            นักวิ่ง {index + 1}
            {distance ? ` · ${distance.distanceKm} กม.` : ""}
          </h2>
          {firstName?.trim() ? (
            <p className="truncate text-sm text-muted-foreground">{firstName}</p>
          ) : null}
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`ลบนักวิ่ง ${index + 1}`}
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>

      <Controller
        control={control}
        name={`${name}.distanceId`}
        render={({ field }) => (
          <ChoiceGroup
            label="ระยะ"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={e?.distanceId?.message}
            options={distances.map((d) => ({
              value: d.id,
              disabled: d.remaining <= 0 && d.id !== field.value,
              label: (
                <span className="flex flex-col leading-tight">
                  <span>{d.distanceKm} กม.</span>
                  <span className="text-xs font-normal opacity-80">
                    {d.remaining <= 0 ? "เต็ม" : formatBaht(d.price)}
                  </span>
                </span>
              ),
            }))}
          />
        )}
      />

      <SectionTitle>ข้อมูลส่วนตัว</SectionTitle>
      <SelectField
        label="คำนำหน้า"
        options={lookups.titles.map((t) => ({ value: t.id, label: t.nameTh }))}
        error={e?.titleId?.message}
        {...register(`${name}.titleId`, { setValueAs: toNumber })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="ชื่อ"
          autoComplete={auto("given-name")}
          error={e?.firstName?.message}
          {...register(`${name}.firstName`)}
        />
        <TextField
          label="นามสกุล"
          autoComplete={auto("family-name")}
          error={e?.lastName?.message}
          {...register(`${name}.lastName`)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="วันเกิด"
          type="date"
          max={today}
          autoComplete={auto("bday")}
          error={e?.birthDate?.message}
          {...register(`${name}.birthDate`)}
        />
        <SelectField
          label="สัญชาติ"
          options={lookups.nationalities.map((n) => ({ value: n.id, label: n.nameTh }))}
          error={e?.nationalityId?.message}
          {...register(`${name}.nationalityId`, { setValueAs: toNumber })}
        />
      </div>
      <Controller
        control={control}
        name={`${name}.gender`}
        render={({ field }) => (
          <ChoiceGroup
            label="เพศ"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={e?.gender?.message}
            options={genders.map((g) => ({ value: g.value, label: g.label }))}
          />
        )}
      />
      <TextField
        label="เบอร์โทร"
        type="tel"
        inputMode="tel"
        placeholder="08x-xxx-xxxx"
        autoComplete={auto("tel")}
        error={e?.phone?.message}
        {...register(`${name}.phone`)}
      />

      <Controller
        control={control}
        name={`${name}.shirtSizeId`}
        render={({ field }) => (
          <ChoiceGroup
            label="ไซซ์เสื้อ"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={e?.shirtSizeId?.message}
            columns="grid-cols-3 sm:grid-cols-6"
            options={shirtSizes.map((s) => ({
              value: s.id,
              label: s.size,
              disabled: s.remaining <= 0 && s.id !== field.value,
            }))}
            hint={
              size ? (
                <span>
                  ไซซ์ {size.size}
                  {size.detail ? ` · ${size.detail}` : ""}
                  {size.remaining > 0 && size.remaining <= 10 ? (
                    <span className="font-medium text-warning"> · เหลือ {size.remaining} ตัว</span>
                  ) : null}
                </span>
              ) : (
                "ไซซ์ที่จางคือหมดแล้ว"
              )
            }
          />
        )}
      />

      <SectionTitle>ผู้ติดต่อฉุกเฉิน</SectionTitle>
      <TextField
        label="ชื่อ-นามสกุล"
        placeholder="คนที่ติดต่อได้ในวันงาน"
        autoComplete="off"
        error={e?.emergencyContact?.name?.message}
        {...register(`${name}.emergencyContact.name`)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="ความสัมพันธ์"
          options={lookups.emergencyRelations.map((r) => ({ value: r.id, label: r.nameTh }))}
          error={e?.emergencyContact?.relationId?.message}
          {...register(`${name}.emergencyContact.relationId`, { setValueAs: toNumber })}
        />
        <TextField
          label="เบอร์โทร"
          type="tel"
          inputMode="tel"
          placeholder="08x-xxx-xxxx"
          autoComplete="off"
          error={e?.emergencyContact?.phone?.message}
          {...register(`${name}.emergencyContact.phone`)}
        />
      </div>

      <SectionTitle>ข้อมูลสุขภาพ</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <SelectField
          label="กรุ๊ปเลือด"
          options={lookups.bloodTypes.map((b) => ({ value: b.id, label: b.nameTh }))}
          error={e?.bloodTypeId?.message}
          {...register(`${name}.bloodTypeId`, { setValueAs: toNumber })}
        />
        <TextField
          label="โรคประจำตัว / แพ้ยา"
          placeholder="ถ้ามี"
          autoComplete="off"
          error={e?.medicalNote?.message}
          {...register(`${name}.medicalNote`)}
        />
      </div>
    </section>
  )
}

function RunnersFormSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="กำลังโหลดฟอร์ม">
      {[0, 1].map((i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-2xl bg-muted", i ? "h-24" : "h-[36rem]")}
        />
      ))}
    </div>
  )
}
