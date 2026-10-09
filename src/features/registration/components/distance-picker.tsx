"use client"

import { useRouter } from "next/navigation"
import { formatBaht } from "@/lib/format"
import { cn } from "@/lib/utils"
import { setFirstRunnerDistance, useRegistrationDraft } from "../draft-store"
import type { Distance } from "../types"

/** เหลือที่ไม่เกินสัดส่วนนี้ของโควตา ถือว่าใกล้เต็ม */
const nearlyFullRatio = 0.1

export function DistancePicker({ distances }: { distances: Distance[] }) {
  const router = useRouter()
  const draft = useRegistrationDraft()
  const selectedId = draft.runners[0]?.distanceId
  const selected = distances.find((d) => d.id === selectedId && d.remaining > 0)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (selected) router.push("/register/runners")
      }}
    >
      <fieldset className="flex flex-col gap-3">
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

      <div
        className="mt-2 flex items-center gap-4 rounded-2xl border bg-muted p-4"
        aria-live="polite"
      >
        <div className="grow">
          <p className="text-sm text-muted-foreground">ระยะที่เลือก</p>
          <p className="font-semibold">
            {selected ? `${selected.name} · ${selected.distanceKm} กม.` : "ยังไม่ได้เลือก"}
          </p>
        </div>
        {selected ? (
          <p className="font-heading text-2xl font-semibold">{formatBaht(selected.price)}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!selected}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ถัดไป · ข้อมูลนักวิ่ง
      </button>
    </form>
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

  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col gap-3.5 rounded-2xl border bg-card p-4.5 transition-colors",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
        checked ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
        soldOut && "cursor-not-allowed opacity-50",
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
      <div className="flex items-center gap-3.5">
        <span className="flex w-14 shrink-0 flex-col items-center" aria-hidden>
          <span className="font-heading text-4xl leading-tight font-bold text-primary">
            {distanceKm}
          </span>
          <span className="text-xs text-muted-foreground">กม.</span>
        </span>
        <span className="min-w-0 grow">
          <span className="block text-[17px] font-semibold">
            {name}
            <span className="sr-only"> {distanceKm} กม.</span>
          </span>
          <span className="block text-sm text-muted-foreground">{description}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end text-right">
          <span className="font-heading text-xl font-semibold">{formatBaht(price)}</span>
          {isEarlyBird ? (
            <span className="text-xs text-muted-foreground">
              <span className="sr-only">ราคาปกติ </span>
              <span className="line-through">{formatBaht(regularPrice)}</span>
            </span>
          ) : null}
        </span>
      </div>
      <span className="flex flex-col gap-1.5">
        <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span
            className={cn("block h-full", nearlyFull || soldOut ? "bg-warning" : "bg-primary")}
            style={{ width: `${usedPercent}%` }}
          />
        </span>
        <span className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs",
              nearlyFull || soldOut ? "font-medium text-warning" : "text-muted-foreground",
            )}
          >
            {soldOut
              ? "เต็มแล้ว"
              : `${nearlyFull ? "ใกล้เต็ม " : ""}เหลือ ${remaining.toLocaleString("th-TH")} จาก ${quota.toLocaleString("th-TH")} ที่`}
          </span>
          {isEarlyBird ? (
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-gold-foreground">
              Early bird
            </span>
          ) : null}
        </span>
      </span>
    </label>
  )
}

export function DistancePickerSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="กำลังโหลดระยะ">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  )
}
