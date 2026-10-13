/** กลุ่มการกระทำสำหรับกรอง: action ลงท้ายด้วยจุด = ทั้งกลุ่ม (docs/admin-api-frontend-guide.md หัวข้อ 7.4) */
export const actionGroups = [
  { value: "auth.", label: "เข้าสู่ระบบ / รหัสผ่าน" },
  { value: "user.", label: "ผู้ใช้หลังบ้าน" },
  { value: "payment.", label: "ตรวจสลิป" },
  { value: "refund.", label: "คืนเงิน" },
  { value: "event.", label: "ตั้งค่างาน" },
  { value: "promo.", label: "โค้ดส่วนลด" },
  { value: "order.", label: "ใบสมัคร (เลขพัสดุ)" },
  { value: "checkin.", label: "เช็กอิน" },
  { value: "export.", label: "ส่งออกข้อมูล" },
  { value: "broadcast.", label: "ประกาศ LINE" },
] as const

const labels: Record<string, string> = {
  "auth.login": "เข้าสู่ระบบ",
  "auth.login_failed": "เข้าสู่ระบบไม่สำเร็จ",
  "auth.change_password": "เปลี่ยนรหัสผ่าน",
  "user.create": "สร้างผู้ใช้",
  "user.update": "แก้ไขผู้ใช้",
  "user.bootstrap": "สร้างผู้ดูแลระบบคนแรก",
  "payment.approve": "อนุมัติสลิป",
  "payment.reject": "ปฏิเสธสลิป",
  "payment.recheck": "ส่งตรวจสลิปซ้ำ",
  "refund.create": "ขอคืนเงิน",
  "refund.approve": "อนุมัติคืนเงิน",
  "refund.reject": "ปฏิเสธคืนเงิน",
  "refund.complete": "โอนคืนเงินแล้ว",
  "event.create": "สร้างงาน",
  "event.update": "แก้ไขข้อมูลงาน",
  "event.distances.update": "แก้ไขระยะ/โควตา",
  "event.shirtsizes.update": "แก้ไขไซซ์เสื้อ",
  "event.shipping.update": "แก้ไขวิธีรับของ",
  "promo.create": "สร้างโค้ดส่วนลด",
  "promo.update": "แก้ไขโค้ดส่วนลด",
  "order.tracking": "ใส่เลขพัสดุ",
  "checkin.confirm": "เช็กอิน",
  "checkin.undo": "ยกเลิกเช็กอิน",
  "export.runners": "ส่งออกรายชื่อนักวิ่ง",
  "broadcast.create": "สร้างประกาศ",
  "broadcast.update": "แก้ไขประกาศ",
  "broadcast.send": "ส่งประกาศ",
  "broadcast.cancel": "ยกเลิกประกาศ",
}

export const actionLabel = (action: string) => labels[action] ?? action

const show = (v: unknown) => (v === undefined ? "—" : typeof v === "string" ? v : JSON.stringify(v))

/** ฟิลด์ที่ค่าเปลี่ยน (หรือมีแค่ค่าใหม่/ค่าเก่า) เรียงตามชื่อ */
export function changedFields(before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].sort()
  return keys
    .filter((k) => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]))
    .map((key) => ({ key, before: show(before?.[key]), after: show(after?.[key]) }))
}
