import { cacheLife } from "next/cache"
import { ApiError, apiFetch } from "@/lib/api/client"
import { mockDistances, mockEvent, mockLookups, mockShippingOptions, mockShirtSizes } from "./mocks"
import { getMockOrder, getMockTickets } from "./mock-orders"
import type {
  ApiDistance,
  ApiEvent,
  ApiOrder,
  ApiPaymentInfo,
  ApiShippingOption,
  ApiShirtSize,
  ApiTicket,
  ApiZipMatch,
} from "./api-types"
import type {
  Distance,
  EventInfo,
  Lookups,
  OrderSummary,
  OrderTickets,
  PaymentInfo,
  ShippingOption,
  ShirtSize,
  ZipMatch,
} from "./types"

export const eventSlug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "hueb-run-2027"

/** ใช้ข้อมูลจำลองจนกว่า API จะพร้อม ตั้ง API_MOCK=false ใน .env.local เพื่อเรียก API จริง */
export const useMock = process.env.API_MOCK !== "false"

/** รายละเอียดที่ API ยังไม่มี ใช้ข้อความคงที่จากชุดข้อมูลจำลองจนกว่าจะเพิ่มใน API */
export function toEvent(e: ApiEvent): EventInfo {
  return {
    slug: e.slug,
    name: e.name,
    tagline: mockEvent.tagline,
    eventDate: e.eventDate,
    venue: null,
    registrationOpensAt: e.registrationOpensAt,
    registrationClosesAt: e.registrationClosesAt,
    bibPickup: null,
  }
}

export function toDistance(d: ApiDistance): Distance {
  return {
    id: d.id,
    name: d.name,
    distanceKm: d.distanceKm,
    description: mockDistances.find((m) => m.distanceKm === d.distanceKm)?.description ?? "",
    price: d.price,
    regularPrice: d.regularPrice,
    earlyBirdEndsAt: d.earlyBirdEndsAt,
    quota: d.quota,
    remaining: d.remaining,
  }
}

export function toShippingOption(o: ApiShippingOption): ShippingOption {
  return {
    ...o,
    description: mockShippingOptions.find((m) => m.type === o.type)?.description ?? "",
  }
}

export function toZipMatch(z: ApiZipMatch): ZipMatch {
  return {
    subdistrictId: z.subdistrict.id,
    subdistrict: z.subdistrict.nameTh,
    district: z.district.nameTh,
    province: z.province.nameTh,
  }
}

export function toOrderSummary(o: ApiOrder): OrderSummary {
  return {
    orderId: o.orderId,
    orderNo: o.orderNo,
    status: o.status,
    paymentStatus: o.payment?.status ?? "Pending",
    total: o.total,
    payableAmount: o.payableAmount,
    expiresAt: o.expiresAt,
    rejectReason: o.payment?.rejectReason ?? null,
    line: o.line,
  }
}

export async function getEvent(): Promise<EventInfo> {
  if (useMock) return mockEvent
  return toEvent(await apiFetch<ApiEvent>(`/events/${eventSlug}`, { cache: "no-store" }))
}

export async function getDistances(): Promise<Distance[]> {
  if (useMock) return mockDistances
  const list = await apiFetch<ApiDistance[]>(`/events/${eventSlug}/distances`, {
    cache: "no-store",
  })
  return list.map(toDistance)
}

export async function getShirtSizes(): Promise<ShirtSize[]> {
  if (useMock) return mockShirtSizes
  return apiFetch<ApiShirtSize[]>(`/events/${eventSlug}/shirt-sizes`, { cache: "no-store" })
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
  const list = await apiFetch<ApiShippingOption[]>(`/events/${eventSlug}/shipping-options`, {
    cache: "no-store",
  })
  return list.map(toShippingOption)
}

/** null = ไม่พบออเดอร์ */
export async function getOrder(orderId: string): Promise<OrderSummary | null> {
  if (useMock) return getMockOrder(orderId)
  try {
    return toOrderSummary(await apiFetch<ApiOrder>(`/orders/${orderId}`, { cache: "no-store" }))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** null = จ่ายแล้วหรือออเดอร์ไม่อยู่ในสถานะที่จ่ายได้แล้ว (API ตอบ 409) */
export async function getPaymentInfo(order: OrderSummary): Promise<PaymentInfo | null> {
  if (useMock) {
    return {
      // ตั้งใจไม่ใช่ PromptPay จริง กันสแกนแล้วโอนเข้าเบอร์คนอื่น ของจริงมาจาก API
      promptPayPayload: `HUEB-RUN-DEMO|${order.orderNo}|${order.payableAmount.toFixed(2)}`,
      accountName: "[ชื่อบัญชีรับเงิน]",
      payableAmount: order.payableAmount,
      isDemo: true,
    }
  }
  try {
    const info = await apiFetch<ApiPaymentInfo>(`/orders/${order.orderId}/payment`, {
      cache: "no-store",
    })
    return {
      promptPayPayload: info.qrPayload,
      accountName: info.accountName,
      payableAmount: info.amount,
      isDemo: false,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return null
    throw error
  }
}

/** null = ยังไม่จ่าย/ไม่พบ */
export async function getTickets(orderId: string): Promise<OrderTickets | null> {
  if (useMock) return getMockTickets(orderId)
  try {
    const [order, tickets, distances] = await Promise.all([
      apiFetch<ApiOrder>(`/orders/${orderId}`, { cache: "no-store" }),
      apiFetch<ApiTicket[]>(`/orders/${orderId}/tickets`, { cache: "no-store" }),
      getDistances(),
    ])
    return {
      orderNo: order.orderNo,
      total: order.total,
      deliveryType: order.shipping.type,
      tickets: tickets.map((t) => {
        const runner = order.runners.find((r) => r.registrationId === t.registrationId)
        return {
          ...t,
          distanceKm: distances.find((d) => d.id === runner?.distance.id)?.distanceKm ?? 0,
          shirtSize: runner?.shirtSize.size ?? "",
        }
      }),
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 409)) return null
    throw error
  }
}
