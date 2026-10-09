import type { Metadata } from "next"
import { Suspense } from "react"
import { Mascot } from "@/components/mascot"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "สมัครสำเร็จ" }

export default function SuccessPage({ params }: PageProps<"/register/success/[orderId]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Mascot pose="thumbs-up" sizes="160px" className="h-auto w-40" />
        <h1 className="text-2xl font-semibold">สมัครสำเร็จ</h1>
      </div>
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
      title="บัตรนักวิ่ง"
      design="Success.dc.html"
      notes={`orderId: ${orderId} · เรียก GET /orders/{orderId}/tickets`}
    />
  )
}
