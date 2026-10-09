import {
  BellRing,
  CalendarCheck,
  Download,
  Home,
  MapPin,
  PackageCheck,
  QrCode,
  Shirt,
} from "lucide-react"
import Link from "next/link"
import { Mascot } from "@/components/mascot"
import { formatBaht } from "@/lib/format"
import type { EventInfo, OrderTickets, Ticket } from "../types"

/** ลิงก์เพิ่มเพื่อน LINE OA (ตั้งใน .env.local เมื่อมีบัญชีจริง) */
const lineOaUrl = process.env.NEXT_PUBLIC_LINE_OA_URL || "#"

export type TicketWithQr = Ticket & { qrSvg: string; qrPng: string }

const confetti = [
  { x: "-150px", r: "220deg", delay: "0s", color: "var(--primary)", w: 8, h: 14 },
  { x: "-110px", r: "-160deg", delay: ".08s", color: "var(--gold)", w: 10, h: 10 },
  { x: "-70px", r: "300deg", delay: ".15s", color: "#7c9be0", w: 6, h: 14 },
  { x: "-30px", r: "-240deg", delay: ".05s", color: "var(--gold)", w: 8, h: 8 },
  { x: "20px", r: "200deg", delay: ".12s", color: "var(--primary)", w: 6, h: 12 },
  { x: "60px", r: "-300deg", delay: ".02s", color: "#7c9be0", w: 10, h: 6 },
  { x: "100px", r: "260deg", delay: ".18s", color: "var(--gold)", w: 8, h: 14 },
  { x: "140px", r: "-200deg", delay: ".1s", color: "var(--primary)", w: 10, h: 10 },
  { x: "-130px", r: "320deg", delay: ".3s", color: "var(--gold)", w: 6, h: 10 },
  { x: "120px", r: "-280deg", delay: ".26s", color: "#7c9be0", w: 8, h: 8 },
  { x: "-50px", r: "180deg", delay: ".34s", color: "var(--primary)", w: 6, h: 6 },
  { x: "80px", r: "-220deg", delay: ".38s", color: "var(--gold)", w: 8, h: 12 },
]

export function SuccessHero({ order, runnerCount }: { order: OrderTickets; runnerCount: number }) {
  return (
    <section className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[2rem] bg-linear-to-b from-[#dceaff] via-[#eef5ff] to-white px-5 pt-8 pb-8 text-center sm:pt-10">
      {/* กระดาษสีพุ่งออกจากเหนือน้อง (ตกแต่งเท่านั้น) */}
      <div aria-hidden className="pointer-events-none absolute top-6 left-1/2">
        {confetti.map((piece, i) => (
          <span
            key={i}
            className="confetti-piece absolute rounded-[2px]"
            style={
              {
                width: piece.w,
                height: piece.h,
                background: piece.color,
                "--x": piece.x,
                "--r": piece.r,
                "--delay": piece.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <Mascot
        pose="thumbs-up"
        highPriority
        sizes="200px"
        className="relative h-auto w-36 sm:w-44"
      />

      <div className="flex flex-col gap-2">
        <p className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary shadow-sm">
          <PackageCheck className="size-4" aria-hidden />
          ตรวจสลิปผ่านแล้ว
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">สมัครสำเร็จ!</h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับสู่ HUEB RUN · ใบสมัคร{" "}
          <strong className="text-foreground">{order.orderNo}</strong>
        </p>
      </div>

      <dl className="flex flex-wrap justify-center gap-2 text-sm">
        <Chip label="นักวิ่ง" value={`${runnerCount} คน`} />
        <Chip label="ยอดชำระ" value={formatBaht(order.total)} />
        <Chip
          label="รับของ"
          value={order.deliveryType === "Post" ? "ส่งไปรษณีย์" : "รับเองหน้างาน"}
        />
      </dl>
    </section>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

/** บัตรนักวิ่งแบบตั๋ว: หัวไล่สี + เลขบิบใหญ่ + รอยปรุ + QR เช็กอิน */
export function TicketCard({
  ticket,
  eventName,
  deliveryType,
  bibPickup,
}: {
  ticket: TicketWithQr
  eventName: string
  deliveryType: OrderTickets["deliveryType"]
  bibPickup: string | null
}) {
  const fullName = `${ticket.firstName} ${ticket.lastName}`
  return (
    <article
      aria-label={`บัตรนักวิ่ง ${fullName} เลขบิบ ${ticket.bibNumber}`}
      className="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 shadow-primary/10 ring-border"
    >
      {/* หัวบัตร */}
      <header className="relative overflow-hidden bg-linear-to-br from-primary via-[#1d5be0] to-[#2f6fe8] px-5 pt-5 pb-6 text-primary-foreground">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 -right-2 font-heading text-[7rem] leading-none font-bold text-white/10 italic"
        >
          {ticket.distanceKm}K
        </span>
        <div className="relative flex items-center justify-between gap-3">
          <EventName name={eventName} />
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">
            {ticket.distanceKm} กม.
          </span>
        </div>
        <p className="relative mt-1 text-sm text-white/80">{ticket.distanceName}</p>
      </header>

      {/* เนื้อบัตร */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">BIB</p>
            <p className="font-heading text-5xl leading-none font-bold tracking-wider text-primary tabular-nums sm:text-6xl">
              {ticket.bibNumber}
            </p>
          </div>
          <p className="truncate font-heading text-xl font-semibold">{fullName}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <Shirt className="size-4 text-primary" aria-hidden />
              เสื้อ {ticket.shirtSize}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <PackageCheck className="size-4 text-primary" aria-hidden />
              {deliveryType === "Post" ? "ส่งไปรษณีย์" : "รับเองหน้างาน"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 self-center">
          <div
            role="img"
            aria-label={`QR เช็กอินของ ${fullName}`}
            className="size-44 rounded-2xl border p-1.5 sm:size-36 [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: ticket.qrSvg }}
          />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <QrCode className="size-3.5" aria-hidden />
            QR เช็กอิน
          </span>
        </div>
      </div>

      {/* รอยปรุ */}
      <div aria-hidden className="relative h-0">
        <span className="absolute -top-3 -left-3 size-6 rounded-full bg-background ring-1 ring-border" />
        <span className="absolute -top-3 -right-3 size-6 rounded-full bg-background ring-1 ring-border" />
        <span className="absolute inset-x-5 top-0 border-t-2 border-dashed border-border" />
      </div>

      {/* ท้ายบัตร */}
      <footer className="flex flex-col gap-3 px-5 pt-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {deliveryType === "Post"
            ? "จัดส่งเสื้อและบิบทางไปรษณีย์ เก็บ QR นี้ไว้ใช้ยืนยันตัวในวันงาน"
            : `แสดง QR นี้ที่จุดรับบิบ · ${bibPickup ?? "[วันที่และสถานที่รับบิบ]"}`}
        </p>
        <a
          href={ticket.qrPng}
          download={`HUEB-RUN-${ticket.bibNumber}.png`}
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-primary/25 px-4 text-sm font-semibold text-primary hover:bg-muted"
        >
          <Download className="size-4" aria-hidden />
          บันทึก QR
        </a>
      </footer>
    </article>
  )
}

/** "HUEB RUN 2027" → คำว่า RUN เป็นสีทองแบบโลโก้ */
function EventName({ name }: { name: string }) {
  const at = name.indexOf("RUN")
  return (
    <p className="font-heading text-lg font-bold tracking-wide italic">
      {at < 0 ? (
        name
      ) : (
        <>
          {name.slice(0, at)}
          <span className="text-gold">RUN</span>
          {name.slice(at + 3)}
        </>
      )}
    </p>
  )
}

const nextSteps = [
  {
    icon: BellRing,
    title: "เพิ่มเพื่อน LINE OA",
    text: "รับแจ้งวันรับบิบ ประกาศสำคัญ และเตือนก่อนวันงาน",
  },
  {
    icon: QrCode,
    title: "เก็บ QR ไว้ในเครื่อง",
    text: "บันทึก QR หรือแคปหน้าจอบัตร ใช้แสดงตอนรับบิบ",
  },
  {
    icon: CalendarCheck,
    title: "เจอกันวันงาน",
    text: "อุ่นเครื่องให้พร้อม แล้ววิ่งไปด้วยกันให้ถึงเส้นชัย",
  },
]

export function SuccessActions({ event }: { event: EventInfo }) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border bg-white p-5 sm:p-6">
      <h2 className="font-heading text-xl font-semibold">ขั้นต่อไป</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {nextSteps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-3 sm:flex-col">
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
              <Icon className="size-5" aria-hidden />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {i + 1}
              </span>
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="block text-sm text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={lineOaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#06C755] font-heading font-semibold text-white hover:opacity-90"
        >
          <BellRing className="size-5" aria-hidden />
          เพิ่มเพื่อน LINE OA รับแจ้งเตือน
        </a>
        <Link
          href="/"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary/25 px-6 font-semibold text-primary hover:bg-muted"
        >
          <Home className="size-5" aria-hidden />
          กลับหน้าแรก
        </Link>
      </div>
      {event.eventDate ? null : (
        <p className="text-center text-xs text-muted-foreground">
          วันงานและสถานที่จะแจ้งทาง LINE และหน้าเว็บ
        </p>
      )}
    </section>
  )
}
