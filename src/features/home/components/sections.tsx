import { ChevronDown, Medal, MessageCircleMore, Shirt } from "lucide-react"
import { Mascot } from "@/components/mascot"
import { Reveal } from "@/components/reveal"

/** หัวข้อของแต่ละส่วน มีขีดทองใต้หัวข้อตามดีไซน์ */
export function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="flex scroll-mt-24 flex-col gap-3 text-2xl font-bold sm:text-3xl">
      {children}
      <span className="h-1 w-12 rounded-full bg-gold" aria-hidden />
    </h2>
  )
}

export function SouvenirSection() {
  const items = [
    { icon: Shirt, label: "เสื้อวิ่ง" },
    { icon: Medal, label: "เหรียญที่ระลึก" },
  ]
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 lg:py-14">
      <Reveal className="grid items-center gap-8 rounded-[2rem] bg-linear-to-br from-muted to-white p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <SectionHeading>ของที่ระลึก</SectionHeading>
          <p className="text-muted-foreground">
            เสื้อวิ่งและเหรียญที่ระลึก ออกแบบพิเศษสำหรับชาว HUEB RUN
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-4">
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-primary/30 bg-white/70 p-4 text-center"
            >
              {/* แทนด้วยรูปจริงเมื่อได้ภาพเสื้อ/เหรียญ */}
              <Icon className="size-14 text-primary" strokeWidth={1.4} aria-hidden />
              <span className="font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">รอภาพจริง</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}

const steps = [
  { title: "เลือกระยะ", detail: "3 / 5 / 10 กม. ดูโควตาที่เหลือได้ทันที" },
  { title: "กรอกข้อมูลนักวิ่ง", detail: "สมัครให้เพื่อนได้หลายคนในใบเดียว" },
  { title: "จ่ายด้วย PromptPay", detail: "สแกน QR แล้วแนบสลิป ระบบตรวจให้อัตโนมัติ" },
  { title: "รับ QR เช็กอิน", detail: "ใช้รับบิบหน้างาน และรับแจ้งเตือนทาง LINE" },
]

export function StepsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 lg:py-14">
      <div className="flex flex-col gap-8">
        <SectionHeading>สมัครง่าย 4 ขั้น</SectionHeading>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Reveal
                delay={i * 0.08}
                className="flex h-full flex-col gap-3 rounded-3xl border bg-white p-5"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="font-heading text-lg font-semibold">{step.title}</span>
                <span className="text-sm text-muted-foreground">{step.detail}</span>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** คำตอบที่มี [ ... ] ต้องแก้เป็นข้อมูลจริงก่อนเปิดรับสมัคร */
const faqs = [
  {
    q: "สมัครให้เพื่อนหรือครอบครัวในใบเดียวได้ไหม",
    a: "ได้ เพิ่มนักวิ่งได้หลายคนในใบสมัครเดียว แต่ละคนเลือกระยะและไซซ์เสื้อของตัวเอง แล้วจ่ายเงินครั้งเดียว",
  },
  {
    q: "ชำระเงินอย่างไร",
    a: "สแกน QR PromptPay ตามยอดที่ระบบแสดง (มีเศษสตางค์ไว้จับคู่ใบสมัคร) แล้วแนบสลิป ระบบจะตรวจและแจ้งผลทาง LINE",
  },
  {
    q: "ต้องจ่ายภายในกี่นาที",
    a: "ระบบจองที่ให้ 30 นาทีหลังกดไปชำระเงิน ถ้าเกินเวลาที่นั่งจะถูกคืนให้คนอื่น สมัครใหม่ได้ถ้ายังมีที่ว่าง",
  },
  {
    q: "รับเสื้อและเลขบิบที่ไหน",
    a: "เลือกได้ตอนสมัคร: รับเองหน้างานโดยแสดง QR เช็กอิน [วันที่และสถานที่รับบิบ] หรือส่งทางไปรษณีย์ (มีค่าส่งต่อใบสมัคร)",
  },
  {
    q: "ยกเลิกหรือขอคืนเงินได้ไหม",
    a: "[นโยบายคืนเงินของผู้จัดงาน]",
  },
]

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-10 lg:py-14">
      <div className="flex flex-col gap-8">
        <SectionHeading id="faq">คำถามที่พบบ่อย</SectionHeading>
        <div className="flex flex-col gap-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border bg-white open:shadow-sm">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown
                  className="size-5 shrink-0 text-primary transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="px-5 pb-5 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-6 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:flex-row sm:text-left">
        <Mascot pose="waving" sizes="120px" className="h-auto w-24 shrink-0" />
        <div className="flex grow flex-col gap-1">
          <p className="font-heading text-xl font-semibold">
            HUEB <span className="text-gold">RUN</span>
          </p>
          <p className="text-sm text-primary-foreground/80">[ชื่อผู้จัดงาน] · [ช่องทางติดต่อ]</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#"
            className="flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-5 text-sm font-semibold hover:bg-white/10"
          >
            <MessageCircleMore className="size-4" aria-hidden />
            LINE OA
          </a>
          <a
            href="#"
            className="flex min-h-11 items-center rounded-full border border-white/40 px-5 text-sm font-semibold hover:bg-white/10"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  )
}
