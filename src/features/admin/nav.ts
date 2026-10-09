import {
  ClipboardList,
  FileClock,
  Gauge,
  Megaphone,
  ReceiptText,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  TicketPercent,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { pageAccess, type AdminRole } from "./auth/access"

/** เมนูหลังบ้าน (docs/ui-flow.md หน้า 8–18) สิทธิ์อยู่ใน auth/access.ts ที่เดียว */
export type AdminNavItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export type AdminNavGroup = { label: string; items: AdminNavItem[] }

export const adminNav: AdminNavGroup[] = [
  {
    label: "ภาพรวม",
    items: [
      {
        href: "/admin",
        label: "แดชบอร์ด",
        description: "ยอดสมัคร รายได้ และโควตาของแต่ละระยะ",
        icon: Gauge,
      },
    ],
  },
  {
    label: "การสมัคร",
    items: [
      {
        href: "/admin/orders",
        label: "ใบสมัคร",
        description: "ค้นหา กรองสถานะ และส่งออก Excel",
        icon: ClipboardList,
      },
      {
        href: "/admin/payments",
        label: "ตรวจสลิป",
        description: "อนุมัติหรือปฏิเสธสลิปที่ระบบตรวจไม่ได้",
        icon: ReceiptText,
      },
      {
        href: "/admin/runners",
        label: "นักวิ่ง & เลขบิบ",
        description: "รายชื่อนักวิ่ง ไซซ์เสื้อ และสถานะเช็กอิน",
        icon: UsersRound,
      },
      {
        href: "/admin/refunds",
        label: "คืนเงิน",
        description: "คำขอคืนเงินและการอนุมัติ",
        icon: RotateCcw,
      },
    ],
  },
  {
    label: "วันงาน",
    items: [
      {
        href: "/admin/checkin",
        label: "เช็กอิน / รับของ",
        description: "สแกน QR หรือค้นหาเพื่อยืนยันรับบิบ",
        icon: ScanLine,
      },
    ],
  },
  {
    label: "ตั้งค่างาน",
    items: [
      {
        href: "/admin/quota",
        label: "ระยะ & โควตา",
        description: "ราคา early bird สต็อกเสื้อ เวลาเปิด/ปิดรับ",
        icon: SlidersHorizontal,
      },
      {
        href: "/admin/promos",
        label: "โปรโมชัน",
        description: "โค้ดส่วนลดและจำนวนการใช้",
        icon: TicketPercent,
      },
      {
        href: "/admin/broadcasts",
        label: "ประกาศ LINE",
        description: "ส่งข่าวถึงนักวิ่งตามกลุ่ม ตั้งเวลาได้",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "ระบบ",
    items: [
      {
        href: "/admin/users",
        label: "ผู้ใช้ & สิทธิ์",
        description: "บัญชีหลังบ้าน บทบาท และงานที่เข้าถึงได้",
        icon: ShieldCheck,
      },
      {
        href: "/admin/audit",
        label: "Audit log",
        description: "ใครทำอะไร เมื่อไหร่ ค่าเก่า/ค่าใหม่",
        icon: FileClock,
      },
    ],
  },
]

/** เมนูเฉพาะที่บทบาทนี้เข้าได้ (ตัดกลุ่มที่ว่างทิ้ง) */
export function navFor(role: AdminRole): AdminNavGroup[] {
  return adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        pageAccess.find((p) => p.href === item.href)?.roles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function findNavItem(pathname: string) {
  const items = adminNav.flatMap((g) => g.items)
  return [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
