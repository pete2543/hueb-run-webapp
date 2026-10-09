"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const links = [
  { href: "#about", label: "เกี่ยวกับงาน" },
  { href: "#distances", label: "ระยะวิ่ง" },
  { href: "#faq", label: "คำถามที่พบบ่อย" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-white/85 backdrop-blur supports-backdrop-filter:bg-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 lg:h-20">
        <Link href="/" aria-label="HUEB RUN หน้าแรก">
          <Logo className="h-8 lg:h-9" />
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-8 lg:flex">
          {links.map(({ href, label }) => (
            <a key={href} href={href} className="text-sm font-medium hover:text-primary">
              {label}
            </a>
          ))}
        </nav>

        <Link
          href="/register"
          className="hidden min-h-11 items-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-primary/90 lg:flex"
        >
          สมัครวิ่ง
        </Link>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full hover:bg-muted lg:hidden"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label="เมนูหลัก"
        className={cn("border-t bg-white px-5 pb-5 lg:hidden", open ? "block" : "hidden")}
      >
        <ul className="flex flex-col">
          {links.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b font-medium"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/register"
          className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
        >
          สมัครวิ่ง
        </Link>
      </nav>
    </header>
  )
}
