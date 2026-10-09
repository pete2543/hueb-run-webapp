/** เมนูหลังบ้าน ตาม docs/ui-flow.md (หน้า 8–18) */
export const adminNav = [
  { href: "/admin", label: "แดชบอร์ด" },
  { href: "/admin/orders", label: "ใบสมัคร" },
  { href: "/admin/payments", label: "ตรวจสลิป" },
  { href: "/admin/runners", label: "นักวิ่ง & เลขบิบ" },
  { href: "/admin/quota", label: "ระยะ & โควตา" },
  { href: "/admin/promos", label: "โปรโมชัน" },
  { href: "/admin/checkin", label: "เช็กอิน / รับของ" },
  { href: "/admin/broadcasts", label: "ประกาศ LINE" },
  { href: "/admin/refunds", label: "คืนเงิน" },
  { href: "/admin/users", label: "ผู้ใช้ & สิทธิ์" },
  { href: "/admin/audit", label: "Audit log" },
] as const
