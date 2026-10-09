"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { adminNav } from "../nav"

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="เมนูหลังบ้าน" className="flex flex-col gap-1">
      {adminNav.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center rounded-lg px-3 text-sm",
              active
                ? "bg-sidebar-accent font-semibold text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
