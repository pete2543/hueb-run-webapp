import { NextResponse, type NextRequest } from "next/server"
import { sessionCookie } from "@/features/admin/auth/session"

/** API ตอบ 401 (token หมดอายุ/ถูกเพิกถอน): ล้าง session แล้วกลับไป login */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url))
  response.cookies.delete({ name: sessionCookie, path: "/admin" })
  return response
}
