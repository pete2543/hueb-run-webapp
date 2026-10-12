import "server-only"
import { cookies } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"
import { ApiError, apiFetch } from "@/lib/api/client"
import { sessionCookie, verifySession } from "../auth/session"
import type { AdminSession } from "../auth/session"

/**
 * เรียก Admin API ฝั่ง server เท่านั้น: แนบ Bearer จาก session ทุกครั้ง
 * 401 = token หมดอายุ/ถูกเพิกถอน → ล้าง session แล้วไป login · อ่าน cookie ตอน request จึงต้องอยู่ใน <Suspense>
 */

/** โหมดข้อมูลจำลองไม่มี API ให้เรียก */
export class MockModeError extends Error {}

export async function adminSession(): Promise<AdminSession> {
  const session = await verifySession((await cookies()).get(sessionCookie)?.value)
  if (!session) redirect("/admin/session-expired")
  return session
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await adminSession()
  if (!session.token) throw new MockModeError("โหมดข้อมูลจำลอง: ไม่มีข้อมูลจาก API")
  try {
    return await apiFetch<T>(`/admin${path}`, {
      cache: "no-store",
      ...init,
      headers: { Authorization: `Bearer ${session.token}`, ...init?.headers },
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/admin/session-expired")
    throw error
  }
}

/** งานที่หน้าหลังบ้านกำลังดู: งานแรกที่มีสิทธิ์ ถ้าเป็น SuperAdmin ใช้งานตาม NEXT_PUBLIC_EVENT_SLUG */
export async function adminEventId(): Promise<number> {
  const session = await adminSession()
  const first = session.eventIds?.[0]
  if (first != null) return first
  const slug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "hueb-run-2027"
  const event = await apiFetch<{ id: number }>(`/events/${slug}`, { cache: "no-store" })
  return event.id
}

/** แปลง error ของ API เป็นข้อความไทยสำหรับแสดงให้แอดมิน */
export function describeError(error: unknown): string {
  // redirect()/notFound() ที่โยนมาจาก adminFetch ต้องไม่ถูกกลืนใน catch ของหน้า
  unstable_rethrow(error)
  if (error instanceof MockModeError) return error.message
  if (error instanceof ApiError) {
    if (error.status === 403) return "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้"
    if (error.status === 404 && error.code === "UNKNOWN") return "ไม่พบ endpoint บน API (ยังไม่ได้ deploy?)"
    return error.message
  }
  return "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง"
}
