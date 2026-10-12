import type { Metadata } from "next"
import { Suspense } from "react"
import { adminEventId, adminFetch } from "@/features/admin/api/server"
import type { Promo } from "@/features/admin/api/types"
import { AdminCard, AdminPageHeader } from "@/features/admin/components/admin-page"
import { ApiNotice } from "@/features/admin/components/admin-ui"
import { PromoManager } from "@/features/admin/components/promo-manager"
import { findNavItem } from "@/features/admin/nav"

const href = "/admin/promos"

export const metadata: Metadata = { title: findNavItem(href)?.label }

export default function PromosPage() {
  return (
    <>
      <AdminPageHeader href={href} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <PromosContent />
      </Suspense>
    </>
  )
}

async function PromosContent() {
  try {
    const id = await adminEventId()
    const promos = await adminFetch<Promo[]>(`/events/${id}/promos`)
    return (
      <AdminCard>
        <PromoManager eventId={id} initial={promos} />
      </AdminCard>
    )
  } catch (error) {
    return <ApiNotice error={error} />
  }
}
