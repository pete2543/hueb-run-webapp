import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getEvent, getOrder, getTickets } from "@/features/registration/api"
import {
  SuccessActions,
  SuccessHero,
  TicketCard,
} from "@/features/registration/components/success-view"
import { qrPngDataUrl, qrSvg } from "@/lib/qr"

export const metadata: Metadata = { title: "สมัครสำเร็จ", robots: { index: false } }

export default function SuccessPage({ params }: PageProps<"/register/success/[orderId]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Suspense fallback={<SuccessSkeleton />}>
        <OrderTicketsView params={params} />
      </Suspense>
    </main>
  )
}

async function OrderTicketsView({
  params,
}: Pick<PageProps<"/register/success/[orderId]">, "params">) {
  const { orderId } = await params
  const order = await getOrder(orderId)
  if (!order) notFound()
  if (order.status !== "Paid") redirect(`/register/payment/${orderId}`)

  const [data, event] = await Promise.all([getTickets(orderId), getEvent()])
  if (!data) notFound()

  const tickets = await Promise.all(
    data.tickets.map(async (ticket) => ({
      ...ticket,
      qrSvg: await qrSvg(ticket.checkInToken),
      qrPng: await qrPngDataUrl(ticket.checkInToken),
    })),
  )

  return (
    <>
      <SuccessHero order={data} runnerCount={tickets.length} />
      <section aria-labelledby="tickets-heading" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 id="tickets-heading" className="font-heading text-2xl font-bold">
            บัตรนักวิ่ง
          </h2>
          <p className="text-sm text-muted-foreground">แคปหน้าจอหรือบันทึก QR เก็บไว้</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.registrationId}
              ticket={ticket}
              eventName={event.name}
              deliveryType={data.deliveryType}
              bibPickup={event.bibPickup}
            />
          ))}
        </div>
      </section>
      <SuccessActions event={event} />
    </>
  )
}

function SuccessSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="กำลังโหลดบัตรนักวิ่ง">
      <div className="h-80 animate-pulse rounded-[2rem] bg-muted" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  )
}
