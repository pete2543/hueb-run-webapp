import Link from "next/link"
import { CalendarDays, ChevronRight, MapPin } from "lucide-react"
import { formatThaiDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventInfo } from "@/features/registration/types"
import { HeroVisual } from "./hero-visual"

export function Hero({ event }: { event: EventInfo }) {
  return (
    <section
      id="about"
      className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-6 px-5 pt-6 pb-10 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pt-12 lg:pb-16"
    >
      <div className="flex flex-col gap-5 text-center lg:text-left">
        <p className="hidden text-sm font-semibold tracking-[0.2em] text-primary lg:block">
          HUEB RUN
        </p>
        <h1 className="text-[2.6rem] leading-[1.15] font-bold sm:text-5xl lg:text-6xl">
          วิ่งด้วยกัน
          <span className="block text-primary">ให้ถึงเส้นชัย</span>
        </h1>
        <p className="text-lg text-muted-foreground">{event.tagline}</p>

        <EventFacts event={event} className="hidden lg:flex" />

        <div className="hidden gap-3 lg:flex">
          <Link
            href="/register"
            className="flex min-h-14 items-center gap-2 rounded-full bg-primary px-8 font-heading text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            เลือกระยะ &amp; สมัคร
            <ChevronRight className="size-5" aria-hidden />
          </Link>
          <a
            href="#distances"
            className="flex min-h-14 items-center rounded-full border-2 border-primary/30 px-8 font-heading text-lg font-semibold text-primary hover:bg-muted"
          >
            ดูรายละเอียด
          </a>
        </div>
      </div>

      <HeroVisual className="-mx-5 aspect-[5/4] rounded-none sm:mx-0 sm:rounded-[2rem] lg:aspect-[6/5]" />

      <EventFacts event={event} className="lg:hidden" />

      <Link
        id="hero-cta"
        href="/register"
        className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary font-heading text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 lg:hidden"
      >
        เลือกระยะ &amp; สมัคร
        <ChevronRight className="size-5" aria-hidden />
      </Link>
    </section>
  )
}

/** วันงาน + สถานที่ (มือถืออยู่ใต้ฉาก, เดสก์ท็อปอยู่ใต้หัวข้อ) */
function EventFacts({ event, className }: { event: EventInfo; className?: string }) {
  return (
    <dl className={cn("flex gap-3", className)}>
      <InfoItem
        icon={<CalendarDays className="size-5" aria-hidden />}
        label="วันจัดงาน"
        value={event.eventDate ? formatThaiDate(event.eventDate) : "เร็ว ๆ นี้"}
      />
      <InfoItem
        icon={<MapPin className="size-5" aria-hidden />}
        label="สถานที่"
        value={event.venue ?? "เร็ว ๆ นี้"}
      />
    </dl>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border bg-white p-3 text-left lg:flex-none lg:pr-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate font-semibold">{value}</dd>
      </div>
    </div>
  )
}
