"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** ปุ่มสมัครติดขอบล่างบนมือถือ โผล่เมื่อเลื่อนพ้นปุ่มสมัครใน hero (#hero-cta) แล้ว */
export function MobileCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById("hero-cta")
    if (!target) return
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting))
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t bg-white/90 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      inert={!visible}
    >
      <Link
        href="/register"
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary font-heading font-semibold text-primary-foreground"
      >
        เลือกระยะ &amp; สมัคร
        <ChevronRight className="size-5" aria-hidden />
      </Link>
    </div>
  )
}
