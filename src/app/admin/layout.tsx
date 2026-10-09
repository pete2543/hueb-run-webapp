import type { Metadata } from "next"
import { Logo } from "@/components/logo"
import { AdminSidebar } from "@/features/admin/components/admin-sidebar"

export const metadata: Metadata = {
  title: { default: "หลังบ้าน", template: "%s · หลังบ้าน HuebRun" },
  robots: { index: false, follow: false },
}

/** เลย์เอาต์หลังบ้าน: เดสก์ท็อป 1280px เมนูซ้าย + เนื้อหา */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4">
        <span className="flex items-baseline gap-2 px-3">
          <Logo />
          <span className="text-xs font-medium text-muted-foreground">Admin</span>
        </span>
        <AdminSidebar />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-8">{children}</main>
    </div>
  )
}
