"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { ApiError, apiFetch } from "@/lib/api/client"
import { homeFor, type AdminRole } from "./access"
import { mockAdminPassword, mockAdmins } from "./mock-users"
import { sessionCookie, sessionMaxAgeSeconds, signSession } from "./session"

export type LoginState = {
  error?: string
  fieldErrors?: { email?: string; password?: string }
  email?: string
}

const loginSchema = z.object({
  email: z.email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
  next: z.string().optional(),
})

const useMock = process.env.API_MOCK !== "false"

type AdminUser = { id: string; name: string; email: string; role: AdminRole }

async function authenticate(email: string, password: string): Promise<AdminUser | null> {
  if (useMock) {
    const user = mockAdmins.find((u) => u.email === email.toLowerCase())
    const expected = mockAdminPassword()
    return user && expected && password === expected ? user : null
  }
  try {
    return await apiFetch<AdminUser>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 400)) return null
    throw error
  }
}

/** กลับไปหน้าที่ตั้งใจจะเข้าได้เฉพาะเส้นทางใน /admin (กัน open redirect) */
function safeNext(next: string | undefined) {
  return next && /^\/admin(\/[\w\-/]*)?$/.test(next) && next !== "/admin/login" ? next : null
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  const email = String(formData.get("email") ?? "")
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors
    return { email, fieldErrors: { email: fields.email?.[0], password: fields.password?.[0] } }
  }

  // TODO: จำกัดจำนวนครั้งที่ลองผิด (rate limit) ฝั่ง API
  const user = await authenticate(parsed.data.email, parsed.data.password)
  if (!user) return { email, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }

  const token = await signSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
  ;(await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: sessionMaxAgeSeconds,
  })
  redirect(safeNext(parsed.data.next) ?? homeFor(user.role))
}

export async function logout() {
  ;(await cookies()).delete({ name: sessionCookie, path: "/admin" })
  redirect("/admin/login")
}
