import Link from "next/link"
import { Logo } from "@/components/logo"
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
      <PagePlaceholder
        title="หน้าแรก"
        design="Main.dc.html"
        notes="hero 3D ให้โหลดแบบ lazy (next/dynamic, ssr: false) มีภาพนิ่งสำรอง และเคารพ prefers-reduced-motion"
      />
    </main>
  )
}
