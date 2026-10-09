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
