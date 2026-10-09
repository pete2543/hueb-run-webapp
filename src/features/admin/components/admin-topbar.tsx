"use client"

import { ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { roleLabels } from "../auth/access"
import { logout } from "../auth/actions"
import { findNavItem } from "../nav"
import { SidebarPanel, initialsOf, type AdminUserView } from "./admin-sidebar"

export function AdminTopbar({ admin }: { admin: AdminUserView }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = findNavItem(pathname)

  return (
    <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur supports-backdrop-filter:bg-white/70">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:h-18 lg:px-8">
        {/* มือถือ/แท็บเล็ต: เมนูเลื่อนออกจากซ้าย */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="เปิดเมนู"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted lg:hidden"
        >
          <Menu className="size-6" aria-hidden />
        </button>
        <Drawer open={menuOpen} onOpenChange={setMenuOpen} swipeDirection="left">
          <DrawerContent className="w-[min(20rem,85vw)] data-[swipe-axis=x]:[--drawer-content-width:min(20rem,85vw)]">
            <DrawerTitle className="sr-only">เมนูหลังบ้าน</DrawerTitle>
            <SidebarPanel admin={admin} onNavigate={() => setMenuOpen(false)} />
          </DrawerContent>
        </Drawer>

        <div className="min-w-0 grow">
          {/* มือถือ: ชื่อหน้า · คอม: breadcrumb (ชื่อหน้าตัวใหญ่อยู่ในหัวหน้าแล้ว) */}
          <p className="truncate font-heading text-lg font-semibold lg:hidden">
            {current?.label ?? "หลังบ้าน"}
          </p>
          <nav aria-label="ตำแหน่งปัจจุบัน" className="hidden lg:block">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>หลังบ้าน</li>
              {current ? (
                <>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="font-semibold text-foreground">
                    {current.label}
                  </li>
                </>
              ) : null}
            </ol>
          </nav>
        </div>

        <span className="hidden items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm md:flex">
          <span className="size-2 rounded-full bg-[#22c55e]" aria-hidden />
          HUEB RUN 2027
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex min-h-11 items-center gap-2 rounded-full border bg-white py-1 pr-2.5 pl-1 transition hover:bg-muted data-popup-open:bg-muted"
            aria-label="เมนูผู้ใช้"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
              {initialsOf(admin.name)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-36 truncate text-sm font-semibold">{admin.name}</span>
              <span className="block text-xs text-muted-foreground">{roleLabels[admin.role]}</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
            <div className="px-2.5 py-2">
              <p className="truncate font-semibold">{admin.name}</p>
              <p className="truncate text-sm text-muted-foreground">{admin.email}</p>
              <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-primary">
                {roleLabels[admin.role]}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-10 gap-2 rounded-lg px-2.5"
              render={<a href="/" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-4" aria-hidden />
              เปิดหน้าเว็บนักวิ่ง
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-h-10 gap-2 rounded-lg px-2.5 text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="size-4" aria-hidden />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
