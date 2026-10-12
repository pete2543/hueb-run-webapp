import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getOrder, getPaymentInfo } from "@/features/registration/api"
import { PaymentView } from "@/features/registration/components/payment-view"
import { StepHeader } from "@/features/registration/components/step-header"
import { qrPngDataUrl, qrSvg } from "@/lib/qr"

export const metadata: Metadata = { title: "ชำระเงิน", robots: { index: false } }

export default function PaymentPage({ params }: PageProps<"/register/payment/[orderId]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <StepHeader current={4} backHref="/register/summary" />
      {/* orderId รู้ได้ตอน request และสถานะต้องสดเสมอ จึงอยู่ใน Suspense (Cache Components) */}
      <Suspense fallback={<div className="h-[36rem] animate-pulse rounded-3xl bg-muted" />}>
        <OrderPayment params={params} />
      </Suspense>
    </main>
  )
}

async function OrderPayment({ params }: Pick<PageProps<"/register/payment/[orderId]">, "params">) {
  const { orderId } = await params
  const order = await getOrder(orderId)
  if (!order) notFound()
  if (order.status === "Paid") redirect(`/register/success/${orderId}`)

  // หมดเวลา/ยกเลิก: API ไม่ให้ข้อมูลโอนแล้ว (409) แสดงเฉพาะสถานะ
  const payment = order.status === "Pending" ? await getPaymentInfo(order) : null
  const [svg, png] = payment
    ? await Promise.all([qrSvg(payment.promptPayPayload), qrPngDataUrl(payment.promptPayPayload)])
    : ["", ""]

  return <PaymentView initialOrder={order} payment={payment} qrSvg={svg} qrPng={png} />
}
