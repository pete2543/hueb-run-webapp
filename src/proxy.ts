import { NextResponse, type NextRequest } from "next/server"
import { canAccess, homeFor } from "@/features/admin/auth/access"
import { sessionCookie, verifySession } from "@/features/admin/auth/session"

/**
 * กันหน้าหลังบ้านชั้นแรก (optimistic check ตามแนวทาง Next.js)
 * - ยังไม่ login → /admin/login?next=…
 * - login แล้วแต่ไม่มีสิทธิ์หน้านั้น → หน้าแรกของบทบาท
 * หน้า/ข้อมูลจริงต้องตรวจสิทธิ์ซ้ำฝั่งเซิร์ฟเวอร์ (getCurrentAdmin, API) เสมอ
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(sessionCookie)?.value)

  // เคลียร์ session ที่ API ไม่รับแล้ว (ลบ cookie ใน server component ไม่ได้ จึงผ่าน route handler)
  if (pathname === "/admin/session-expired") return NextResponse.next()

  if (pathname === "/admin/login") {
    return session
      ? NextResponse.redirect(new URL(homeFor(session.role), request.url))
      : NextResponse.next()
  }

  if (!session) {
    const login = new URL("/admin/login", request.url)
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search)
    return NextResponse.redirect(login)
  }

  if (!canAccess(session.role, pathname)) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
