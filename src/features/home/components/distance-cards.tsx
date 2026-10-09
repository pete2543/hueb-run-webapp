"use client"

import Link from "next/link"
import { ChevronRight, Footprints, Mountain, Rabbit } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { formatBaht } from "@/lib/format"
import { setFirstRunnerDistance } from "@/features/registration/draft-store"
import type { Distance } from "@/features/registration/types"

/** ไอคอนตามลำดับระยะ สั้น → ยาว */
const icons = [Footprints, Rabbit, Mountain]

/** การ์ดระยะในหน้าแรก กดแล้วเลือกระยะนั้นไว้ให้ในขั้นตอนที่ 1 */
export function DistanceCards({ distances }: { distances: Distance[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
      {distances.map((distance, i) => {
        const Icon = icons[Math.min(i, icons.length - 1)]
        const soldOut = distance.remaining <= 0
        const isEarlyBird = distance.price < distance.regularPrice
        return (
          <li key={distance.id}>
            <Reveal delay={i * 0.08} className="h-full">
              <Link
                href="/register"
                onClick={() => {
                  if (!soldOut) setFirstRunnerDistance(distance.id)
                }}
                className="group flex h-full items-center gap-4 rounded-3xl border bg-white p-4 shadow-sm shadow-primary/5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:p-5"
              >
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-8" aria-hidden />
                </span>
                <span className="min-w-0 grow">
                  <span className="block font-heading text-lg font-semibold">
                    {distance.name} · {distance.distanceKm} กม.
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {distance.description}
                  </span>
                  <span className="mt-1 flex items-baseline gap-2">
                    {soldOut ? (
                      <span className="text-sm font-semibold text-warning">เต็มแล้ว</span>
                    ) : (
                      <>
                        <span className="font-heading text-lg font-semibold text-primary">
                          {formatBaht(distance.price)}
                        </span>
                        {isEarlyBird ? (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatBaht(distance.regularPrice)}
                          </span>
                        ) : null}
                      </>
                    )}
                  </span>
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ChevronRight className="size-5" aria-hidden />
                </span>
              </Link>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}
