import { cacheLife } from "next/cache"
import { ApiError, apiFetch } from "@/lib/api/client"
import { mockDistances, mockEvent, mockLookups, mockShippingOptions, mockShirtSizes } from "./mocks"
import { getMockOrder } from "./mock-orders"
import type {
  Distance,
  EventInfo,
  Lookups,
  OrderSummary,
  PaymentInfo,
  ShippingOption,
  ShirtSize,
} from "./types"

export const eventSlug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "hueb-run-2027"

/** ใช้ข้อมูลจำลองจนกว่า API จะพร้อม ตั้ง API_MOCK=false ใน .env.local เพื่อเรียก API จริง */
export const useMock = process.env.API_MOCK !== "false"

export async function getEvent(): Promise<EventInfo> {
  if (useMock) return mockEvent
  return apiFetch<EventInfo>(`/events/${eventSlug}`, { cache: "no-store" })
}

export async function getDistances(): Promise<Distance[]> {
  if (useMock) return mockDistances
  return apiFetch<Distance[]>(`/events/${eventSlug}/distances`, { cache: "no-store" })
}

export async function getShirtSizes(): Promise<ShirtSize[]> {
  if (useMock) return mockShirtSizes
  return apiFetch<ShirtSize[]>(`/events/${eventSlug}/shirt-sizes`, { cache: "no-store" })
}

/** ตัวเลือกทั่วไปเปลี่ยนไม่บ่อย cache ไว้เป็นชั่วโมง */
export async function getLookups(): Promise<Lookups> {
  "use cache"
  cacheLife("hours")
  if (useMock) return mockLookups
  return apiFetch<Lookups>("/lookups")
}

export async function getShippingOptions(): Promise<ShippingOption[]> {
  if (useMock) return mockShippingOptions
  return apiFetch<ShippingOption[]>(`/events/${eventSlug}/shipping-options`, { cache: "no-store" })
}

/** null = ไม่พบออเดอร์ */
export async function getOrder(orderId: string): Promise<OrderSummary | null> {
  if (useMock) return getMockOrder(orderId)
  try {
    return await apiFetch<OrderSummary>(`/orders/${orderId}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function getPaymentInfo(order: OrderSummary): Promise<PaymentInfo> {
  if (useMock) {
    return {
      // ตั้งใจไม่ใช่ PromptPay จริง กันสแกนแล้วโอนเข้าเบอร์คนอื่น ของจริงมาจาก API
      promptPayPayload: `HUEB-RUN-DEMO|${order.orderNo}|${order.payableAmount.toFixed(2)}`,
      accountName: "[ชื่อบัญชีรับเงิน]",
      payableAmount: order.payableAmount,
      isDemo: true,
    }
  }
  const info = await apiFetch<Omit<PaymentInfo, "isDemo">>(`/orders/${order.orderId}/payment`, {
    cache: "no-store",
  })
  return { ...info, isDemo: false }
}
