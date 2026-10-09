/**
 * รูปข้อมูลจาก API ฝั่งนักวิ่ง (ร่าง ตาม docs/api-contract.md)
 * ปรับให้ตรงกับ API จริงเมื่อ generate type จาก OpenAPI ได้แล้ว
 */

/** GET /events/{slug} (ค่า null = ยังไม่ประกาศ แสดงเป็น "เร็ว ๆ นี้") */
export type EventInfo = {
  slug: string
  name: string
  tagline: string
  eventDate: string | null
  venue: string | null
  registrationOpensAt: string | null
  registrationClosesAt: string | null
  /** วัน/สถานที่รับบิบ เช่น "18 ม.ค. 2570 · ลานหน้าหอประชุม" */
  bibPickup: string | null
}

/** GET /events/{slug}/distances */
export type Distance = {
  id: number
  name: string
  distanceKm: number
  description: string
  /** ราคาที่ต้องจ่ายตอนนี้ (คิด early bird แล้ว) */
  price: number
  /** ราคาปกติ ถ้ามากกว่า price แปลว่ากำลังอยู่ในช่วง early bird */
  regularPrice: number
  earlyBirdEndsAt: string | null
  quota: number
  remaining: number
}

/** GET /events/{slug}/shirt-sizes */
export type ShirtSize = {
  id: number
  size: string
  /** เช่น "รอบอก 38 นิ้ว" */
  detail: string | null
  remaining: number
}

export type LookupItem = { id: number; nameTh: string }

/** GET /lookups (เรียงตาม SortOrder แล้ว) */
export type Lookups = {
  titles: LookupItem[]
  nationalities: LookupItem[]
  bloodTypes: LookupItem[]
  emergencyRelations: LookupItem[]
}

/** GET /events/{slug}/shipping-options */
export type ShippingOption = {
  id: number
  type: "Pickup" | "Post"
  name: string
  description: string
  fee: number
}

/** GET /geo/zip/{zipCode} คืนได้หลายตำบลต่อรหัสไปรษณีย์ */
export type ZipMatch = {
  subdistrictId: number
  subdistrict: string
  district: string
  province: string
}

/** POST /events/{slug}/promo/validate */
export type PromoResult = {
  code: string
  discount: number
  label: string
}

/** 201 จาก POST /events/{slug}/orders */
export type CreatedOrder = {
  orderId: string
  orderNo: string
  total: number
  payableAmount: number
  expiresAt: string
}

/** ผลของ server action: ไม่ throw ให้หน้าเว็บแสดง error ตาม code ได้ */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; details?: Record<string, unknown> }

/** ตรงกับ enum ใน docs/db-schema/Entities.cs */
export type OrderStatus = "Pending" | "Paid" | "Expired" | "Cancelled" | "Refunded"
export type PaymentStatus = "Pending" | "Verifying" | "NeedsReview" | "Verified" | "Rejected"

/** GET /orders/{orderId} (เฉพาะที่หน้าชำระเงินใช้) */
export type OrderSummary = {
  orderId: string
  orderNo: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  total: number
  payableAmount: number
  expiresAt: string
  /** เหตุผลเมื่อสลิปไม่ผ่าน */
  rejectReason: string | null
}

/** GET /orders/{orderId}/payment */
export type PaymentInfo = {
  /** ข้อความใน QR (ฝั่ง API สร้างตามมาตรฐาน PromptPay/EMVCo) */
  promptPayPayload: string
  accountName: string
  payableAmount: number
  /** true = QR ตัวอย่างระหว่างพัฒนา สแกนจ่ายไม่ได้ */
  isDemo: boolean
}

/** บัตรนักวิ่ง 1 ใบ (GET /orders/{orderId}/tickets เมื่อ Paid) */
export type Ticket = {
  registrationId: number
  bibNumber: string
  firstName: string
  lastName: string
  distanceName: string
  distanceKm: number
  shirtSize: string
  /** ใส่ใน QR ให้สตาฟสแกนตอนรับบิบ */
  checkInToken: string
}

export type OrderTickets = {
  orderNo: string
  total: number
  deliveryType: "Pickup" | "Post"
  tickets: Ticket[]
}
