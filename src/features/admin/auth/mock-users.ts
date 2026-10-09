import type { AdminRole } from "./access"

/**
 * ผู้ใช้หลังบ้านจำลอง (ใช้เมื่อ API_MOCK) รหัสผ่านเดียวกันทุกบัญชี มาจาก ADMIN_DEMO_PASSWORD
 * ระหว่างพัฒนาถ้าไม่ได้ตั้ง ใช้ค่าใน .env.example · production ต้องตั้งเองเสมอ
 */
export const mockAdmins: { id: string; name: string; email: string; role: AdminRole }[] = [
  { id: "a1", name: "ผู้ดูแลระบบ", email: "superadmin@hueb-run.test", role: "SuperAdmin" },
  { id: "a2", name: "ทีมผู้จัดงาน", email: "organizer@hueb-run.test", role: "Organizer" },
  { id: "a3", name: "ฝ่ายการเงิน", email: "finance@hueb-run.test", role: "Finance" },
  { id: "a4", name: "สตาฟหน้างาน", email: "staff@hueb-run.test", role: "Staff" },
]

export function mockAdminPassword() {
  return (
    process.env.ADMIN_DEMO_PASSWORD ||
    (process.env.NODE_ENV === "production" ? undefined : "hueb-demo-2027")
  )
}
