import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { adminEventId } from "@/features/admin/api/server"
import { sessionCookie, verifySession } from "@/features/admin/auth/session"
import { baseUrl } from "@/lib/api/client"

/** ดาวน์โหลด .xlsx นักวิ่งที่จ่ายแล้ว: เรียก API ฝั่ง server แล้ว stream ต่อ ไม่เก็บไฟล์ (มีข้อมูลอ่อนไหว) */
export async function GET(request: NextRequest) {
  const session = await verifySession((await cookies()).get(sessionCookie)?.value)
  if (!session?.token) return NextResponse.redirect(new URL("/admin/session-expired", request.url))
  if (session.role !== "SuperAdmin" && session.role !== "Organizer") {
    return new NextResponse("บัญชีนี้ไม่มีสิทธิ์ส่งออกข้อมูล", { status: 403 })
  }

  const res = await fetch(`${baseUrl}/admin/events/${await adminEventId()}/orders/export`, {
    headers: { Authorization: `Bearer ${session.token}` },
    cache: "no-store",
  })
  if (!res.ok) {
    return new NextResponse(res.status === 401 ? "session หมดอายุ กรุณาเข้าสู่ระบบใหม่" : "ส่งออกไม่สำเร็จ", {
      status: res.status === 401 ? 401 : 502,
    })
  }
  return new NextResponse(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? 'attachment; filename="runners.xlsx"',
      "Cache-Control": "no-store",
    },
  })
}
