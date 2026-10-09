import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sessionCookie, verifySession, type AdminSession } from "./session"

/**
 * ผู้ใช้หลังบ้านที่ login อยู่ (Data Access Layer) อ่าน cookie ตอน request จึงต้องอยู่ใน <Suspense>
 * proxy กันหน้าไว้ชั้นแรกแล้ว ที่นี่ตรวจซ้ำก่อนใช้ข้อมูลจริง
 */
export async function getCurrentAdmin(): Promise<AdminSession> {
  const token = (await cookies()).get(sessionCookie)?.value
  const session = await verifySession(token)
  if (!session) redirect("/admin/login")
  return session
}
