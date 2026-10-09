"use client"

import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Mascot } from "@/components/mascot"
import { formatBaht } from "@/lib/format"
import { cn } from "@/lib/utils"
import { setFirstRunnerDistance, useRegistrationDraft } from "../draft-store"
import type { Distance } from "../types"

/** เหลือที่ไม่เกินสัดส่วนนี้ของโควตา ถือว่าใกล้เต็ม */
const nearlyFullRatio = 0.1

/**
 * ขั้นตอนที่ 1: รายการระยะ (ซ้าย) + สรุปการเลือก (ขวา, ติดหน้าจอบนเดสก์ท็อป)
 * มือถือ: สรุปอยู่ใต้รายการ
 */
export function DistancePicker({
  distances,
  header,
}: {
  distances: Distance[]
  header: React.ReactNode
}) {
  const router = useRouter()
  const draft = useRegistrationDraft()
  const selectedId = draft.runners[0]?.distanceId
  const selected = distances.find((d) => d.id === selectedId && d.remaining > 0)

  return (
    <form
      className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_24rem]"
      onSubmit={(e) => {
        e.preventDefault()
        if (selected) router.push("/register/runners")
      }}
    >
      <div className="lg:col-start-1">{header}</div>

      <fieldset className="flex flex-col gap-4 lg:col-start-1">
        <legend className="sr-only">เลือกระยะ</legend>
        {distances.map((distance) => (
          <DistanceOption
            key={distance.id}
            distance={distance}
            checked={distance.id === selected?.id}
            onSelect={() => setFirstRunnerDistance(distance.id)}
          />
        ))}
      </fieldset>

      <aside
        aria-label="สรุปการเลือก"
        className="flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-lg shadow-primary/5 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-24 lg:self-start lg:p-6"
      >
        <h2 className="hidden font-heading text-xl font-semibold lg:block">สรุปการเลือก</h2>
        <div className="flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-5">
          <Mascot
            pose="thumbs-up"
            sizes="(min-width: 1024px) 240px, 80px"
            className="h-auto w-16 shrink-0 lg:mx-auto lg:w-52"
          />
          <div className="flex grow flex-col gap-3 lg:border-t lg:pt-4" aria-live="polite">
            <div>
              <p className="text-sm text-muted-foreground">ระยะที่เลือก</p>
              <p className="font-heading text-lg font-semibold">
                {selected ? `${selected.name} · ${selected.distanceKm} กม.` : "ยังไม่ได้เลือก"}
              </p>
            </div>
            {selected ? (
              <div className="lg:border-t lg:pt-3">
                <p className="text-sm text-muted-foreground">ค่าสมัคร</p>
                <p className="flex items-center gap-3">
                  <span className="font-heading text-3xl font-bold lg:text-4xl">
                    {formatBaht(selected.price)}
                  </span>
                  {selected.price < selected.regularPrice ? <EarlyBirdBadge /> : null}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">แตะการ์ดระยะเพื่อเลือก</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!selected}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          ถัดไป · ข้อมูลนักวิ่ง
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </aside>
    </form>
  )
}

function EarlyBirdBadge() {
  return (
    <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold whitespace-nowrap text-gold-foreground">
      Early bird
    </span>
  )
}

function DistanceOption({
  distance,
  checked,
  onSelect,
}: {
  distance: Distance
  checked: boolean
  onSelect: () => void
}) {
  const { name, distanceKm, description, price, regularPrice, quota, remaining } = distance
  const soldOut = remaining <= 0
  const nearlyFull = !soldOut && remaining / quota <= nearlyFullRatio
  const usedPercent = Math.min(100, Math.round(((quota - remaining) / quota) * 100))
  const isEarlyBird = price < regularPrice
  const warn = nearlyFull || soldOut

  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-4 rounded-3xl border-2 bg-white p-4 transition sm:gap-5 sm:p-5",
        "has-focus-visible:ring-4 has-focus-visible:ring-primary/25",
        checked
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-transparent shadow-sm ring-1 shadow-primary/5 ring-border hover:ring-primary/40",
        soldOut && "cursor-not-allowed opacity-55",
      )}
    >
      <input
        type="radio"
        name="distance"
        value={distance.id}
        checked={checked}
        disabled={soldOut}
        onChange={onSelect}
        className="sr-only"
      />

      <span
        aria-hidden
        className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-muted py-3 sm:w-24 sm:py-4"
      >
        <span className="font-heading text-4xl leading-none font-bold text-primary sm:text-5xl">
          {distanceKm}
        </span>
        <span className="mt-1 text-sm text-muted-foreground">กม.</span>
      </span>

      <span className="flex min-w-0 grow flex-col justify-between gap-3">
        <span>
          <span className="block font-heading text-lg font-semibold sm:text-xl">
            {name}
            <span className="sr-only"> {distanceKm} กม.</span>
          </span>
          <span className="block text-sm text-muted-foreground sm:text-base">{description}</span>
        </span>

        <span className="flex flex-col gap-1">
          <span className={cn("text-xs font-semibold", warn ? "text-warning" : "text-primary")}>
            {soldOut ? "เต็มแล้ว" : `สมัครแล้ว ${usedPercent}%`}
          </span>
          <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="h-2 grow overflow-hidden rounded-full bg-muted" aria-hidden>
              <span
                className={cn("block h-full rounded-full", warn ? "bg-warning" : "bg-primary")}
                style={{ width: `${usedPercent}%` }}
              />
            </span>
            <span
              className={cn(
                "text-xs sm:whitespace-nowrap",
                warn ? "font-medium text-warning" : "text-muted-foreground",
              )}
            >
              {soldOut
                ? "ระยะนี้ปิดรับแล้ว"
                : `${nearlyFull ? "ใกล้เต็ม · " : ""}เหลือ ${remaining.toLocaleString("th-TH")} จาก ${quota.toLocaleString("th-TH")} ที่`}
            </span>
          </span>
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className="flex items-center gap-2">
          {checked ? (
            <span className="hidden rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-primary sm:inline">
              เลือกแล้ว
            </span>
          ) : null}
          <RadioDot checked={checked} />
        </span>
        <span className="font-heading text-xl font-bold sm:text-2xl">{formatBaht(price)}</span>
        {isEarlyBird ? (
          <>
            <span className="text-xs text-muted-foreground sm:text-sm">
              <span className="sr-only">ราคาปกติ </span>
              <span className="line-through">{formatBaht(regularPrice)}</span>
            </span>
            {!soldOut ? (
              <span className="mt-auto">
                <EarlyBirdBadge />
              </span>
            ) : null}
          </>
        ) : null}
      </span>
    </label>
  )
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 items-center justify-center rounded-full border-2 bg-white",
        checked ? "border-primary" : "border-border",
      )}
    >
      {checked ? <span className="size-3 rounded-full bg-primary" /> : null}
    </span>
  )
}

export function DistancePickerSkeleton() {
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-10"
      aria-busy="true"
      aria-label="กำลังโหลดระยะ"
    >
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
      <div className="hidden h-[30rem] animate-pulse rounded-3xl bg-muted lg:block" />
    </div>
  )
}
