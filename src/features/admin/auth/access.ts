/**
 * บทบาทและสิทธิ์เข้าแต่ละหน้า (docs/ui-flow.md)
 * - SuperAdmin ทำได้ทุกอย่าง
 * - Organizer ตั้งค่างาน ประกาศ เช็กอิน
 * - Finance ตรวจสลิปและคืนเงิน
 * - Staff เช็กอิน/รับของเท่านั้น
 * ใช้ทั้งใน proxy (กันเข้าหน้า) และเมนู (ซ่อนเมนูที่ไม่มีสิทธิ์) ห้าม import ของฝั่ง client/server เฉพาะ
 */

export const roles = ["SuperAdmin", "Organizer", "Finance", "Staff"] as const
export type AdminRole = (typeof roles)[number]

export const roleLabels: Record<AdminRole, string> = {
  SuperAdmin: "ผู้ดูแลระบบ",
  Organizer: "ผู้จัดงาน",
  Finance: "การเงิน",
  Staff: "สตาฟ",
}

/** หน้า → บทบาทที่เข้าได้ (เรียงตามลำดับเมนู หน้าแรกที่เข้าได้คือหน้าเริ่มต้นหลัง login) */
export const pageAccess: { href: string; roles: readonly AdminRole[] }[] = [
  { href: "/admin", roles: ["SuperAdmin", "Organizer", "Finance"] },
  { href: "/admin/orders", roles: ["SuperAdmin", "Organizer", "Finance"] },
  { href: "/admin/payments", roles: ["SuperAdmin", "Finance"] },
  { href: "/admin/runners", roles: ["SuperAdmin", "Organizer", "Finance"] },
  { href: "/admin/refunds", roles: ["SuperAdmin", "Finance"] },
  { href: "/admin/checkin", roles: ["SuperAdmin", "Organizer", "Staff"] },
  { href: "/admin/quota", roles: ["SuperAdmin", "Organizer"] },
  { href: "/admin/promos", roles: ["SuperAdmin", "Organizer"] },
  { href: "/admin/broadcasts", roles: ["SuperAdmin", "Organizer"] },
  { href: "/admin/users", roles: ["SuperAdmin"] },
  { href: "/admin/audit", roles: ["SuperAdmin"] },
]

function matchPage(pathname: string) {
  // หน้าที่ยาวที่สุดที่ตรงก่อน (/admin/orders/123 → /admin/orders)
  return [...pageAccess]
    .sort((a, b) => b.href.length - a.href.length)
    .find((p) => pathname === p.href || pathname.startsWith(`${p.href}/`))
}

export function canAccess(role: AdminRole, pathname: string) {
  const page = matchPage(pathname)
  return page ? page.roles.includes(role) : role === "SuperAdmin"
}

export function homeFor(role: AdminRole) {
  return pageAccess.find((p) => p.roles.includes(role))?.href ?? "/admin/login"
}
