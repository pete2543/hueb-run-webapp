"use server"

import { revalidatePath } from "next/cache"
import { adminFetch, describeError } from "./server"
import type { AdminUserDto, EventSettings, ListKind, PaymentItem, Promo } from "./types"
import { ApiError } from "@/lib/api/client"

export type ActionResult = { ok: true } | { ok: false; error: string }

function fail(error: unknown): ActionResult {
  if (error instanceof ApiError && error.code === "PAYMENT_NOT_REVIEWABLE") {
    return { ok: false, error: "มีคนจัดการสลิปนี้ไปแล้ว กรุณารีเฟรชรายการ" }
  }
  if (error instanceof ApiError && error.code === "CAPACITY_FULL") {
    return { ok: false, error: "โควตา/เสื้อเต็มแล้ว อนุมัติไม่ได้ ต้องคืนเงินให้นักวิ่ง" }
  }
  if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.details) {
    const first = Object.values(error.details).flat()[0]
    if (typeof first === "string") return { ok: false, error: first }
  }
  return { ok: false, error: describeError(error) }
}

/** ลิงก์รูปสลิป (อายุ 5 นาที ขอใหม่ทุกครั้งที่เปิดดู) */
export async function getSlipUrl(paymentId: number): Promise<{ url: string } | { error: string }> {
  try {
    const res = await adminFetch<{ url: string }>(`/payments/${paymentId}/slip`)
    return { url: res.url }
  } catch (error) {
    const f = fail(error)
    return { error: f.ok ? "" : f.error }
  }
}

export async function reviewPayment(
  paymentId: number,
  action: "approve" | "reject" | "recheck",
  note?: string,
): Promise<ActionResult> {
  try {
    await adminFetch<PaymentItem>(`/payments/${paymentId}/${action}`, {
      method: "POST",
      body: action === "reject" ? JSON.stringify({ note }) : undefined,
    })
  } catch (error) {
    revalidatePath("/admin/payments")
    return fail(error)
  }
  revalidatePath("/admin/payments")
  revalidatePath("/admin")
  return { ok: true }
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  role: string
  eventIds: number[]
}): Promise<ActionResult> {
  try {
    await adminFetch<AdminUserDto>("/users", { method: "POST", body: JSON.stringify(input) })
  } catch (error) {
    if (error instanceof ApiError && error.code === "EMAIL_TAKEN") return { ok: false, error: "อีเมลนี้ถูกใช้แล้ว" }
    if (error instanceof ApiError && error.code === "WEAK_PASSWORD") {
      return { ok: false, error: "รหัสผ่านต้องยาวอย่างน้อย 10 ตัวอักษร" }
    }
    return fail(error)
  }
  revalidatePath("/admin/users")
  return { ok: true }
}

export async function updateUser(
  id: string,
  patch: { isActive?: boolean; role?: string; newPassword?: string },
): Promise<ActionResult> {
  try {
    await adminFetch<AdminUserDto>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) })
  } catch (error) {
    if (error instanceof ApiError && error.code === "CANNOT_CHANGE_SELF") {
      return { ok: false, error: "ปิดบัญชีหรือเปลี่ยนบทบาทของตัวเองไม่ได้" }
    }
    if (error instanceof ApiError && error.code === "LAST_SUPER_ADMIN") {
      return { ok: false, error: "ต้องเหลือผู้ดูแลระบบอย่างน้อย 1 คน" }
    }
    return fail(error)
  }
  revalidatePath("/admin/users")
  return { ok: true }
}

export type SaveResult<T> = { ok: true; data: T } | { ok: false; error: string }

/** ข้อความ error ของการตั้งค่างาน (409/400 ของ docs/admin-api-frontend-guide.md หัวข้อ 6) */
function settingsError(error: unknown): string {
  if (error instanceof ApiError) {
    const d = error.details as Record<string, unknown> | undefined
    switch (error.code) {
      case "QUOTA_BELOW_RESERVED":
        return `ลดต่ำกว่าที่จองแล้วไม่ได้ (${d?.name ?? ""} จองไปแล้ว ${d?.reserved ?? "?"})`
      case "BIB_PREFIX_LOCKED":
        return "เปลี่ยนตัวอักษรเลขบิบไม่ได้ เพราะออกเลขบิบไปแล้ว"
      case "IN_USE":
        return "ลบไม่ได้ เพราะมีผู้สมัครหรือออเดอร์อ้างถึงอยู่"
      case "DUPLICATE":
        return "ชื่อ/ไซซ์/ตัวอักษรบิบซ้ำกับรายการอื่น"
      case "NOT_READY_TO_PUBLISH":
        return `เผยแพร่ไม่ได้ ยังขาด: ${Array.isArray(d?.missing) ? d.missing.join(", ") : "ระยะ/ไซซ์/วิธีรับของที่เปิดใช้"}`
      case "PROMO_CODE_TAKEN":
        return "โค้ดนี้ถูกใช้แล้ว (ไม่สนตัวพิมพ์เล็ก/ใหญ่)"
      case "MAX_USES_BELOW_USED":
        return "จำนวนสิทธิ์ต่ำกว่าที่ถูกใช้ไปแล้วไม่ได้"
      case "VALIDATION_ERROR": {
        const first = d && Object.entries(d).flatMap(([k, v]) => (Array.isArray(v) ? v.map((m) => `${k}: ${m}`) : []))[0]
        if (first) return first
      }
    }
  }
  return describeError(error)
}

export async function saveEvent(
  eventId: number,
  body: Record<string, unknown>,
): Promise<SaveResult<{ event: EventSettings; warnings: string[] }>> {
  try {
    const data = await adminFetch<{ event: EventSettings; warnings: string[] }>(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
    revalidatePath("/admin/quota")
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: settingsError(error) }
  }
}

/** ส่งชุดเต็ม: มี id = แก้, ไม่มี id = เพิ่ม, id ที่หายไป = ลบ */
export async function saveList(
  eventId: number,
  kind: ListKind,
  items: Record<string, unknown>[],
): Promise<SaveResult<Record<string, unknown>[]>> {
  try {
    const data = await adminFetch<Record<string, unknown>[]>(`/events/${eventId}/${kind}`, {
      method: "PUT",
      body: JSON.stringify(items),
    })
    revalidatePath("/admin/quota")
    revalidatePath("/admin")
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: settingsError(error) }
  }
}

export async function savePromo(
  eventId: number,
  promoId: number | null,
  body: Record<string, unknown>,
): Promise<SaveResult<Promo>> {
  try {
    const data = await adminFetch<Promo>(
      promoId == null ? `/events/${eventId}/promos` : `/events/${eventId}/promos/${promoId}`,
      { method: promoId == null ? "POST" : "PUT", body: JSON.stringify(body) },
    )
    revalidatePath("/admin/promos")
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: settingsError(error) }
  }
}

export async function setTracking(orderId: string, trackingNo: string): Promise<ActionResult> {
  try {
    await adminFetch<{ trackingNo: string | null }>(`/orders/${orderId}/tracking`, {
      method: "PATCH",
      body: JSON.stringify({ trackingNo: trackingNo.trim() }),
    })
  } catch (error) {
    if (error instanceof ApiError && error.code === "TRACKING_NOT_ALLOWED") {
      return { ok: false, error: "ใส่เลขพัสดุได้เฉพาะออเดอร์ที่จ่ายแล้วและเลือกส่งไปรษณีย์" }
    }
    return fail(error)
  }
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}
