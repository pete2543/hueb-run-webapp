import { Banknote, Clock3, ReceiptText, Users } from "lucide-react"
import type { Metadata } from "next"
import { AdminCard, AdminPageHeader, ComingSoon } from "@/features/admin/components/admin-page"

export const metadata: Metadata = { title: "แดชบอร์ด" }

/** ตัวเลขรอเชื่อม GET /admin/events/{id}/dashboard */
const kpis = [
  { label: "รายได้ที่ยืนยันแล้ว", icon: Banknote, tone: "bg-primary/10 text-primary" },
  { label: "ที่นั่งที่จองแล้ว", icon: Users, tone: "bg-[#7c9be0]/15 text-[#3d63c9]" },
  { label: "รอชำระ", icon: Clock3, tone: "bg-caution/15 text-caution" },
  { label: "สลิปรอตรวจ", icon: ReceiptText, tone: "bg-warning/10 text-warning" },
]

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader href="/admin" />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map(({ label, icon: Icon, tone }) => (
          <li key={label}>
            <AdminCard className="flex h-full flex-col gap-3 p-4 sm:p-5">
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-heading text-2xl font-bold sm:text-3xl">—</span>
            </AdminCard>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminCard className="flex min-h-64 flex-col gap-3 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold">ยอดสมัครรายวัน</h2>
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            กราฟรอเชื่อม API
          </div>
        </AdminCard>
        <AdminCard className="flex min-h-64 flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">โควตาแต่ละระยะ</h2>
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            รอเชื่อม API
          </div>
        </AdminCard>
      </div>

      <ComingSoon
        design="Dashboard.dc.html"
        items={["ตัวเลขจริงจาก API", "กราฟรายวัน", "โควตาแต่ละระยะ", "สถานะคิวแจ้งเตือน"]}
      />
    </>
  )
}
