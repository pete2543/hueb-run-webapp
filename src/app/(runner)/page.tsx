import Link from "next/link"
import { Logo } from "@/components/logo"
import { Mascot } from "@/components/mascot"
import { PagePlaceholder } from "@/components/page-placeholder"

export default function HomePage() {
  return (
    <main className="flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <Logo />
        <Link
          href="/register"
          className="flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          สมัครเลย
        </Link>
      </header>

      <section className="flex flex-col items-center gap-5 text-center">
        <h1 className="text-4xl leading-tight font-bold">
          วิ่งด้วยกัน
          <span className="block text-primary">ให้ถึงเส้นชัย</span>
        </h1>
        <Mascot pose="running" highPriority sizes="224px" className="h-auto w-56" />
        <Link
          href="/register"
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground"
        >
          เลือกระยะ &amp; สมัคร
        </Link>
      </section>

      <PagePlaceholder
        title="หน้าแรก (ส่วนที่เหลือ)"
        design="Main.dc.html"
        notes="นับถอยหลัง early bird, การ์ดระยะ, สิ่งที่จะได้รับ, 4 ขั้นตอน, ลิงก์ LINE/Facebook · ถ้าทำมาสคอตเป็น 3D ให้โหลดแบบ lazy (next/dynamic, ssr: false) ใช้ภาพนิ่งนี้เป็นตัวสำรอง และเคารพ prefers-reduced-motion"
      />
    </main>
  )
}
