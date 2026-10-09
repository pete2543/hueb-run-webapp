"use server"

import { ApiError, apiFetch } from "@/lib/api/client"
import { eventSlug, useMock } from "./api"
import {
  mockDistances,
  mockPromos,
  mockShippingOptions,
  mockShirtSizes,
  mockZipIndex,
} from "./mocks"
import { createOrderSchema, normalizePhone, type CreateOrderPayload } from "./schema"
import { countMockOrders, getMockOrder, markMockSlip, saveMockOrder } from "./mock-orders"
import type { ActionResult, CreatedOrder, OrderSummary, PromoResult, ZipMatch } from "./types"

/**
 * Server actions ของขั้นตอนสมัคร: หน้าเว็บเรียกได้ตรง ๆ โดยไม่ต้องเปิด API ให้ browser
 * โหมด mock คิดราคาเองที่ฝั่งเซิร์ฟเวอร์ (ไม่เชื่อราคาจากหน้าเว็บ) เหมือนที่ API จริงต้องทำ
 */

function fail(code: string, message: string, details?: Record<string, unknown>) {
  return { ok: false as const, code, message, details }
}

async function callApi<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() }
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.message, error.details)
    return fail("NETWORK", "เชื่อมต่อระบบไม่ได้ ลองใหม่อีกครั้ง")
  }
}

function subtotalOf(distanceIds: number[]) {
  return distanceIds.reduce(
    (sum, id) => sum + (mockDistances.find((d) => d.id === id)?.price ?? 0),
    0,
  )
}

function mockPromo(code: string, subtotal: number): ActionResult<PromoResult> {
  const promo = mockPromos[code]
  if (!promo) return fail("PROMO_INVALID", "โค้ดไม่ถูกต้องหรือหมดอายุแล้ว")
  if (promo === "exhausted") return fail("PROMO_EXHAUSTED", "โค้ดนี้ถูกใช้ครบจำนวนแล้ว")
  const discount = promo.type === "fixed" ? promo.value : Math.round((subtotal * promo.value) / 100)
  const label = promo.type === "fixed" ? `ลด ฿${promo.value}` : `ลด ${promo.value}%`
  return { ok: true, data: { code, discount: Math.min(discount, subtotal), label } }
}

export async function validatePromo(
  rawCode: string,
  distanceIds: number[],
): Promise<ActionResult<PromoResult>> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return fail("PROMO_INVALID", "กรุณากรอกโค้ด")
  if (useMock) return mockPromo(code, subtotalOf(distanceIds))
  return callApi(() =>
    apiFetch<PromoResult>(`/events/${eventSlug}/promo/validate`, {
      method: "POST",
      body: JSON.stringify({ code, distanceIds }),
    }),
  )
}

export async function lookupZip(zipCode: string): Promise<ActionResult<ZipMatch[]>> {
  if (!/^\d{5}$/.test(zipCode)) return fail("VALIDATION", "รหัสไปรษณีย์ 5 หลัก")
  if (useMock) return { ok: true, data: mockZipIndex[zipCode] ?? [] }
  return callApi(() => apiFetch<ZipMatch[]>(`/geo/zip/${zipCode}`))
}

export async function createOrder(input: CreateOrderPayload): Promise<ActionResult<CreatedOrder>> {
  const parsed = createOrderSchema.safeParse(input)
  if (!parsed.success) return fail("VALIDATION", "ข้อมูลไม่ครบหรือไม่ถูกต้อง")

  const payload: CreateOrderPayload = {
    ...parsed.data,
    contact: { ...parsed.data.contact, phone: normalizePhone(parsed.data.contact.phone) },
    runners: parsed.data.runners.map((r) => ({
      ...r,
      phone: normalizePhone(r.phone),
      emergencyContact: { ...r.emergencyContact, phone: normalizePhone(r.emergencyContact.phone) },
    })),
    shippingAddress: parsed.data.shippingAddress && {
      ...parsed.data.shippingAddress,
      phone: normalizePhone(parsed.data.shippingAddress.phone),
    },
  }

  if (!useMock) {
    return callApi(() =>
      apiFetch<CreatedOrder>(`/events/${eventSlug}/orders`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    )
  }

  for (const runner of payload.runners) {
    const distance = mockDistances.find((d) => d.id === runner.distanceId)
    if (!distance || distance.remaining <= 0) {
      return fail("QUOTA_FULL", `ระยะ ${distance?.distanceKm ?? ""} กม. เต็มแล้ว`, {
        distanceId: runner.distanceId,
      })
    }
    const size = mockShirtSizes.find((s) => s.id === runner.shirtSizeId)
    if (!size || size.remaining <= 0) {
      return fail("SHIRT_OUT_OF_STOCK", `เสื้อไซซ์ ${size?.size ?? ""} หมดแล้ว`, {
        shirtSizeId: runner.shirtSizeId,
      })
    }
  }

  const subtotal = subtotalOf(payload.runners.map((r) => r.distanceId))
  let discount = 0
  if (payload.promoCode) {
    const promo = mockPromo(payload.promoCode, subtotal)
    if (!promo.ok) return promo
    discount = promo.data.discount
  }
  const fee = mockShippingOptions.find((o) => o.id === payload.shippingOptionId)?.fee ?? 0
  const total = subtotal - discount + fee
  // เศษสตางค์ไม่ซ้ำต่อออเดอร์ ใช้จับคู่ยอดโอน (ของจริงสุ่มและตรวจ unique ที่ DB)
  const satang = (Math.floor(Math.random() * 99) + 1) / 100
  const order: CreatedOrder = {
    orderId: crypto.randomUUID(),
    orderNo: `RUN27-${String(countMockOrders() + 123).padStart(6, "0")}`,
    total,
    payableAmount: Math.round((total + satang) * 100) / 100,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }
  saveMockOrder({
    ...order,
    status: "Pending",
    paymentStatus: "Pending",
    rejectReason: null,
    runners: payload.runners.map(({ firstName, lastName, distanceId, shirtSizeId }) => ({
      firstName,
      lastName,
      distanceId,
      shirtSizeId,
    })),
    shippingOptionId: payload.shippingOptionId,
  })
  return { ok: true, data: order }
}

/** สถานะล่าสุดของออเดอร์ หน้าชำระเงินเรียกซ้ำระหว่างรอตรวจสลิป */
export async function getOrderStatus(orderId: string): Promise<ActionResult<OrderSummary>> {
  if (useMock) {
    const order = getMockOrder(orderId)
    return order ? { ok: true, data: order } : fail("NOT_FOUND", "ไม่พบใบสมัคร")
  }
  return callApi(() => apiFetch<OrderSummary>(`/orders/${orderId}`, { cache: "no-store" }))
}

const maxSlipBytes = 4 * 1024 * 1024
const slipTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]

/** POST /orders/{orderId}/payment/slip (multipart) */
export async function uploadSlip(
  orderId: string,
  formData: FormData,
): Promise<ActionResult<OrderSummary>> {
  const file = formData.get("slip")
  if (!(file instanceof File) || file.size === 0) return fail("VALIDATION", "กรุณาเลือกรูปสลิป")
  if (!slipTypes.includes(file.type))
    return fail("VALIDATION", "รองรับเฉพาะไฟล์รูป (JPG, PNG, WEBP, HEIC)")
  if (file.size > maxSlipBytes) return fail("VALIDATION", "ไฟล์ใหญ่เกิน 4MB")

  if (useMock) {
    const order = getMockOrder(orderId)
    if (!order) return fail("NOT_FOUND", "ไม่พบใบสมัคร")
    if (order.status === "Expired") return fail("ORDER_EXPIRED", "หมดเวลาชำระเงินแล้ว")
    if (order.status === "Paid") return { ok: true, data: order }
    markMockSlip(orderId, formData.get("fileName")?.toString() ?? file.name)
    return { ok: true, data: getMockOrder(orderId)! }
  }

  const body = new FormData()
  body.set("slip", file)
  return callApi(() =>
    apiFetch<OrderSummary>(`/orders/${orderId}/payment/slip`, { method: "POST", body }),
  )
}
