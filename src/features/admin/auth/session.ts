import type { AdminRole } from "./access"

/**
 * session ของหลังบ้าน: cookie ที่ลงลายเซ็น HMAC-SHA256 (Web Crypto ใช้ได้ทั้งใน proxy และ server)
 * เก็บแค่ข้อมูลที่จำเป็นต่อการแสดงผลและตรวจสิทธิ์ ไม่เก็บข้อมูลอ่อนไหว
 * เมื่อมี API จริง ให้เก็บ token ที่ API ออกให้แทน แล้วตรวจกับ API
 */

export const sessionCookie = "hueb_admin_session"
export const sessionMaxAgeSeconds = 8 * 60 * 60

export type AdminSession = {
  userId: string
  name: string
  email: string
  role: AdminRole
  /** วินาที (Unix) */
  exp: number
}

const encoder = new TextEncoder()

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET
  if (value) return value
  if (process.env.NODE_ENV === "production") {
    throw new Error("ต้องตั้ง ADMIN_SESSION_SECRET ใน production")
  }
  return "dev-only-secret-change-me"
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
}

function fromBase64Url(text: string) {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function key() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

export async function signSession(session: Omit<AdminSession, "exp">) {
  const payload: AdminSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
  }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

/** null = ไม่มี, ลายเซ็นผิด หรือหมดอายุ */
export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromBase64Url(signature),
      encoder.encode(body),
    )
    if (!valid) return null
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as AdminSession
    return session.exp > Date.now() / 1000 ? session : null
  } catch {
    return null
  }
}
