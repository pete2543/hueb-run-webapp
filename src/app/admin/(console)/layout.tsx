import { Suspense } from "react"
import { AdminTopbar } from "@/features/admin/components/admin-topbar"
import { SidebarPanel } from "@/features/admin/components/admin-sidebar"
import { getCurrentAdmin } from "@/features/admin/auth/current-admin"

/**
 * โครงหลังบ้าน: แถบเมนูซ้าย (คอม) / ลิ้นชัก (มือถือ) + แถบบน + เนื้อหา
 * อ่าน session ตอน request จึงห่อด้วย Suspense (Cache Components)
 */
export default function ConsoleLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  )
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { name, email, role } = await getCurrentAdmin()
  const admin = { name, email, role }
  return (
    <div className="flex min-h-dvh flex-1 bg-[#f4f7fd]">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r bg-white lg:flex">
        <SidebarPanel admin={admin} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={admin} />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh flex-1 bg-[#f4f7fd]" aria-busy="true" aria-label="กำลังโหลด">
      <div className="hidden w-72 shrink-0 border-r bg-white lg:block" />
      <div className="flex flex-1 flex-col">
        <div className="h-16 border-b bg-white lg:h-18" />
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
          <div className="h-12 w-64 animate-pulse rounded-xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  )
}
