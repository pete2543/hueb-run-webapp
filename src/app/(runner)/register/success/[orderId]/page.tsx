import type { Metadata } from "next"
import { Suspense } from "react"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "สมัครสำเร็จ" }

export default function SuccessPage({ params }: PageProps<"/register/success/[orderId]">) {
  return (
    <main className="flex flex-col gap-6">
      <Suspense fallback={<p className="text-muted-foreground">กำลังโหลดบัตรนักวิ่ง…</p>}>
        <OrderTickets params={params} />
      </Suspense>
    </main>
  )
}

async function OrderTickets({ params }: Pick<PageProps<"/register/success/[orderId]">, "params">) {
  const { orderId } = await params
  return (
    <PagePlaceholder
      title="สมัครสำเร็จ"
      design="Success.dc.html"
      notes={`orderId: ${orderId} · เรียก GET /orders/{orderId}/tickets`}
    />
  )
}
