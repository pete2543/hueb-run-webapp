import type { Metadata } from "next"
import { PageShell } from "@/components/page-shell"
import { MyTickets } from "@/features/registration/components/my-tickets"

export const metadata: Metadata = { title: "ตั๋วของฉัน", robots: { index: false } }

export default function MyTicketsPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">ตั๋วของฉัน</h1>
        <p className="text-muted-foreground">
          ใบสมัครที่เชื่อมต่อกับ LINE ของคุณ สถานะการชำระเงิน และบัตรนักวิ่ง
        </p>
      </div>
      <MyTickets />
    </PageShell>
  )
}
