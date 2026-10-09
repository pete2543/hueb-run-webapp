import type { Metadata } from "next"
import { Suspense } from "react"
import { PagePlaceholder } from "@/components/page-placeholder"
import { StepHeader } from "@/features/registration/components/step-header"

export const metadata: Metadata = { title: "ชำระเงิน" }

export default function PaymentPage({ params }: PageProps<"/register/payment/[orderId]">) {
  return (
    <main className="flex flex-col gap-6">
      <StepHeader current={4} backHref="/register/summary" />
      {/* orderId รู้ได้ตอน request เท่านั้น จึงต้องอยู่ใน Suspense (Cache Components) */}
      <Suspense fallback={<p className="text-muted-foreground">กำลังโหลดใบสมัคร…</p>}>
        <OrderPayment params={params} />
      </Suspense>
    </main>
  )
}

async function OrderPayment({ params }: Pick<PageProps<"/register/payment/[orderId]">, "params">) {
  const { orderId } = await params
  return (
    <PagePlaceholder
      title="ชำระเงิน"
      design="Payment.dc.html"
      notes={`orderId: ${orderId} · เรียก GET /orders/{orderId}/payment`}
    />
  )
}
