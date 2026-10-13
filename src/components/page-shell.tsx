import Link from "next/link"
import { Logo } from "@/components/logo"

/** เลย์เอาต์หน้าข้อมูลทั่วไปของนักวิ่ง (ข้อมูลงาน, ตั๋วของฉัน): หัวเบา ๆ มีโลโก้ + ปุ่มสมัคร */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-[#f4f8ff] to-white">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="HUEB RUN หน้าแรก">
            <Logo className="h-8" />
          </Link>
          <Link
            href="/register"
            className="flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            สมัครวิ่ง
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 pt-6 pb-14 lg:pt-10">
        {children}
      </main>
    </div>
  )
}
