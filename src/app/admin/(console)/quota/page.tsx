import type { Metadata } from "next"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { EventSettings } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice } from "@/features/admin/components/admin-ui"
import { EventForm, ListEditor } from "@/features/admin/components/settings-forms"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/quota"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function QuotaPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <QuotaContent />
      </Suspense>
    </>
  )
}

type Row = Record<string, unknown>

async function QuotaContent() {
  try {
    const id = await adminEventId()
    const [event, distances, shirts, shipping] = await Promise.all([
      adminFetch<EventSettings>(`/events/${id}`),
      adminFetch<Row[]>(`/events/${id}/distances`),
      adminFetch<Row[]>(`/events/${id}/shirt-sizes`),
      adminFetch<Row[]>(`/events/${id}/shipping-options`),
    ])
    return (
      <>
        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">ข้อมูลงาน</h2>
          <EventForm key={JSON.stringify(event)} event={event} />
          <p className="text-xs text-muted-foreground">
            เปลี่ยน PromptPay แล้วต้องแก้บัญชีใน SlipOK LIFF ให้ตรงกัน ไม่งั้นทุกสลิปจะถูกปฏิเสธ (WRONG_RECEIVER)
          </p>
        </AdminCard>
        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">ระยะ ราคา และโควตา</h2>
          <ListEditor eventId={id} kind="distances" initial={distances} />
        </AdminCard>
        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">สต็อกเสื้อ</h2>
          <ListEditor eventId={id} kind="shirt-sizes" initial={shirts} />
        </AdminCard>
        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">วิธีรับของ</h2>
          <ListEditor eventId={id} kind="shipping-options" initial={shipping} />
        </AdminCard>
      </>
    )
  } catch (error) {
    return <ApiNotice error={error} />
  }
}
