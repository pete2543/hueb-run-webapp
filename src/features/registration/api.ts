import { apiFetch } from "@/lib/api/client"
import { mockDistances, mockEvent } from "./mocks"
import type { Distance, EventInfo } from "./types"

const eventSlug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "hueb-run-2027"

/** ใช้ข้อมูลจำลองจนกว่า API จะพร้อม ตั้ง API_MOCK=false ใน .env.local เพื่อเรียก API จริง */
const useMock = process.env.API_MOCK !== "false"

export async function getEvent(): Promise<EventInfo> {
  if (useMock) return mockEvent
  return apiFetch<EventInfo>(`/events/${eventSlug}`, { cache: "no-store" })
}

export async function getDistances(): Promise<Distance[]> {
  if (useMock) return mockDistances
  return apiFetch<Distance[]>(`/events/${eventSlug}/distances`, { cache: "no-store" })
}
