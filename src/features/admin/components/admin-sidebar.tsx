"use client"

import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { roleLabels } from "../auth/access"
import { logout } from "../auth/actions"
import type { AdminSession } from "../auth/session"
import { navFor } from "../nav"

export type AdminUserView = Pick<AdminSession, "name" | "email" | "role">

export function initialsOf(name: string) {
  return name.trim().slice(0, 1) || "?"
}

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)
}

/** เนื้อหาแถบเมนู ใช้ทั้งแถบซ้ายบนคอม และลิ้นชักบนมือถือ */
export function SidebarPanel({
  admin,
  onNavigate,
}: {
  admin: AdminUserView
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const groups = navFor(admin.role)

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5 lg:h-18">
        <Link href="/admin" onClick={onNavigate} aria-label="หน้าแรกหลังบ้าน">
          <Logo className="h-7" />
        </Link>
        <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-background">
          ADMIN
        </span>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 rounded-2xl bg-linear-to-br from-primary to-[#2f6fe8] p-3.5 text-primary-foreground">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 font-heading text-sm font-bold">
            27
          </span>
          <span className="min-w-0">
            <span className="block truncate font-heading font-semibold">HUEB RUN 2027</span>
            <span className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden />
              เปิดรับสมัคร
            </span>
          </span>
        </div>
      </div>

      <nav aria-label="เมนูหลังบ้าน" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mt-4 first:mt-1">
            <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                        active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-primary",
                        )}
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-heading font-bold text-primary">
            {initialsOf(admin.name)}
          </span>
          <span className="min-w-0 grow">
            <span className="block truncate text-sm font-semibold">{admin.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {roleLabels[admin.role]}
            </span>
          </span>
          <form action={logout}>
            <button
              type="submit"
              aria-label="ออกจากระบบ"
              title="ออกจากระบบ"
              className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-[18px]" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
