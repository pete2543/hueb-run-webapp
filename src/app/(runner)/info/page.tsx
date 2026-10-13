import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarDays, Car, Clock, MapPin, PackageCheck, QrCode, Ticket, Timer } from "lucide-react"
import { Mascot } from "@/components/mascot"
import { PageShell } from "@/components/page-shell"
import { SectionHeading } from "@/features/home/components/sections"
import {
  cutoffs,
  pickup,
  raceDaySchedule,
  startTimes,
  travel,
  venue,
} from "@/features/info/content"
import { getDistances, getEvent } from "@/features/registration/api"
import { formatBaht, formatThaiDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "ข้อมูลงาน",
  description: "วัน เวลา สถานที่ ระยะวิ่ง ตารางวันงาน และการรับเสื้อ & BIB",
}

export default function InfoPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-56 animate-pulse rounded-[2rem] bg-muted" />}>
        <EventOverview />
      </Suspense>

      <section className="flex flex-col gap-5">
        <SectionHeading id="distances">ระยะและเวลาปล่อยตัว</SectionHeading>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-muted" />}>
          <DistanceTable />
        </Suspense>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="schedule">ตารางเวลาวันงาน</SectionHeading>
        <ol className="flex flex-col rounded-3xl border bg-white p-2">
          {raceDaySchedule.map(({ time, label }) => (
            <li key={label} className="flex items-center gap-4 border-b px-3 py-3 last:border-b-0">
              <span className="w-20 shrink-0 font-heading font-semibold text-primary tabular-nums">
                {time}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="route">เส้นทางวิ่ง</SectionHeading>
        {/* แทนด้วยภาพแผนที่เส้นทางจริง (3 / 5 / 10 กม.) */}
        <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-primary/30 bg-muted/60 p-6 text-center">
          <MapPin className="size-10 text-primary" strokeWidth={1.4} aria-hidden />
          <p className="font-semibold">[ภาพแผนที่เส้นทางวิ่ง]</p>
          <p className="text-sm text-muted-foreground">รอภาพจริงจากผู้จัดงาน</p>
        </div>
      </section>

      <section
        aria-labelledby="pickup"
        className="flex scroll-mt-24 flex-col gap-5 rounded-[2rem] bg-linear-to-br from-muted to-white p-5 sm:p-8"
      >
        <SectionHeading id="pickup">รับเสื้อ & BIB</SectionHeading>
        <dl className="grid gap-3 sm:grid-cols-3">
          <Fact icon={CalendarDays} label="วันที่" value={pickup.dates} />
          <Fact icon={Clock} label="เวลา" value={pickup.hours} />
          <Fact icon={MapPin} label="สถานที่" value={pickup.place} />
        </dl>
        <ul className="flex flex-col gap-3">
          {pickup.notes.map((note, i) => (
            <li key={note} className="flex items-start gap-3">
              {i === 0 ? (
                <QrCode className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              ) : (
                <PackageCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              )}
              <span>{note}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/my-tickets"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-heading font-semibold text-primary-foreground hover:bg-primary/90 sm:w-fit"
        >
          <Ticket className="size-5" aria-hidden />
          ดู QR ในหน้าตั๋วของฉัน
        </Link>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="travel">การเดินทาง</SectionHeading>
        <ul className="grid gap-3 sm:grid-cols-3">
          {travel.map(({ title, detail }) => (
            <li key={title} className="flex flex-col gap-1 rounded-3xl border bg-white p-5">
              <span className="flex items-center gap-2 font-heading font-semibold">
                <Car className="size-5 text-primary" aria-hidden />
                {title}
              </span>
              <span className="text-sm text-muted-foreground">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-[2rem] bg-primary px-5 py-8 text-center text-primary-foreground">
        <Mascot pose="pointing" sizes="120px" className="h-auto w-24" />
        <p className="font-heading text-xl font-semibold">พร้อมวิ่งไปด้วยกันไหม?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-gold px-8 font-heading font-bold text-gold-foreground hover:opacity-90"
          >
            สมัครวิ่ง
          </Link>
          <Link
            href="/#faq"
            className="flex min-h-12 items-center justify-center rounded-2xl border border-white/40 px-8 font-semibold hover:bg-white/10"
          >
            คำถามที่พบบ่อย
          </Link>
        </div>
      </section>
    </PageShell>
  )
}

async function EventOverview() {
  const event = await getEvent()
  const registration =
    event.registrationOpensAt && event.registrationClosesAt
      ? `${formatThaiDate(event.registrationOpensAt)} – ${formatThaiDate(event.registrationClosesAt)}`
      : "[ช่วงเปิดรับสมัคร]"
  return (
    <section className="flex flex-col gap-5 rounded-[2rem] bg-linear-to-b from-[#dceaff] to-white p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">ข้อมูลงาน</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{event.name}</h1>
          <p className="text-muted-foreground">{event.tagline}</p>
        </div>
        <Mascot
          pose="running"
          sizes="140px"
          highPriority
          className="h-auto w-24 shrink-0 sm:w-32"
        />
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Fact
          icon={CalendarDays}
          label="วันงาน"
          value={event.eventDate ? formatThaiDate(event.eventDate) : "[วันจัดงาน]"}
        />
        <Fact icon={MapPin} label="สถานที่" value={event.venue ?? venue.name}>
          <span className="block text-sm text-muted-foreground">{venue.address}</span>
          {venue.mapUrl ? (
            <a
              href={venue.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm font-semibold text-primary underline underline-offset-4"
            >
              เปิดแผนที่
            </a>
          ) : null}
        </Fact>
        <Fact icon={Timer} label="ปล่อยตัวรอบแรก" value={startTimes[10] ?? "[เวลาปล่อยตัว]"} />
        <Fact icon={Ticket} label="เปิดรับสมัคร" value={registration} />
      </dl>
    </section>
  )
}

async function DistanceTable() {
  const distances = await getDistances()
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {distances.map((d) => (
        <li key={d.id} className="flex flex-col gap-3 rounded-3xl border bg-white p-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-heading text-3xl font-bold text-primary">{d.distanceKm} กม.</span>
            <span className="text-sm text-muted-foreground">{d.name}</span>
          </div>
          <dl className="flex flex-col gap-1.5 text-sm">
            <Row label="ปล่อยตัว" value={startTimes[d.distanceKm] ?? "[เวลาปล่อยตัว]"} />
            <Row label="เวลาตัดตัว" value={cutoffs[d.distanceKm] ?? "[cut-off]"} />
            <Row label="ค่าสมัคร" value={formatBaht(d.price)} />
            <Row label="เหลือ" value={d.remaining > 0 ? `${d.remaining} ที่` : "เต็มแล้ว"} />
          </dl>
        </li>
      ))}
    </ul>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  label: string
  value: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-border">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="font-semibold">
          {value}
          {children}
        </dd>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
