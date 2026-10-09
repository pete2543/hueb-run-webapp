import { cacheLife } from "next/cache"
import { apiFetch } from "@/lib/api/client"
import { mockDistances, mockEvent, mockLookups, mockShippingOptions, mockShirtSizes } from "./mocks"
import type { Distance, EventInfo, Lookups, ShippingOption, ShirtSize } from "./types"

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
