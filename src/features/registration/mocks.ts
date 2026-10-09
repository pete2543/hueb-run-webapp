import type { Distance, EventInfo, Lookups, ShippingOption, ShirtSize, ZipMatch } from "./types"

export const mockEvent: EventInfo = {
  slug: "hueb-run-2027",
  name: "HUEB RUN 2027",
  tagline: "งานวิ่งของชาวศิษย์เก่า",
  eventDate: null,
  venue: null,
  registrationOpensAt: null,
  registrationClosesAt: null,
}

/** ข้อมูลจำลองตามเดโม (docs/design/Distances.dc.html) */
export const mockDistances: Distance[] = [
  {
    id: 1,
    name: "Mini Run",
    distanceKm: 3,
    description: "เดิน-วิ่งเบา ๆ ทั้งครอบครัว",
    price: 300,
    regularPrice: 350,
    earlyBirdEndsAt: "2026-12-31T16:59:59Z",
    quota: 300,
    remaining: 120,
  },
  {
    id: 2,
    name: "Fun Run",
    distanceKm: 5,
    description: "ก้าวแรกสำหรับสายสุขภาพ",
    price: 400,
    regularPrice: 450,
    earlyBirdEndsAt: "2026-12-31T16:59:59Z",
    quota: 500,
    remaining: 160,
  },
  {
    id: 3,
    name: "Challenge",
    distanceKm: 10,
    description: "ท้าทายตัวเองให้ถึงเส้นชัย",
    price: 550,
    regularPrice: 600,
    earlyBirdEndsAt: "2026-12-31T16:59:59Z",
    quota: 400,
    remaining: 28,
  },
]

/** ไซซ์และรอบอกเป็นค่าสมมติ รอตารางไซซ์จริงจากผู้จัด */
export const mockShirtSizes: ShirtSize[] = [
  { id: 1, size: "S", detail: "รอบอก 36 นิ้ว", remaining: 80 },
  { id: 2, size: "M", detail: "รอบอก 38 นิ้ว", remaining: 120 },
  { id: 3, size: "L", detail: "รอบอก 40 นิ้ว", remaining: 95 },
  { id: 4, size: "XL", detail: "รอบอก 42 นิ้ว", remaining: 40 },
  { id: 5, size: "2XL", detail: "รอบอก 44 นิ้ว", remaining: 6 },
  { id: 6, size: "3XL", detail: "รอบอก 46 นิ้ว", remaining: 0 },
]

/** ตรงกับ docs/db-schema/SeedData.cs */
export const mockLookups: Lookups = {
  titles: [
    { id: 1, nameTh: "นาย" },
    { id: 2, nameTh: "นาง" },
    { id: 3, nameTh: "นางสาว" },
    { id: 4, nameTh: "เด็กชาย" },
    { id: 5, nameTh: "เด็กหญิง" },
  ],
  nationalities: [
    { id: 1, nameTh: "ไทย" },
    { id: 2, nameTh: "ลาว" },
    { id: 3, nameTh: "เมียนมา" },
    { id: 4, nameTh: "กัมพูชา" },
    { id: 5, nameTh: "อื่น ๆ" },
  ],
  bloodTypes: [
    { id: 1, nameTh: "A" },
    { id: 2, nameTh: "B" },
    { id: 3, nameTh: "AB" },
    { id: 4, nameTh: "O" },
    { id: 5, nameTh: "ไม่ทราบ" },
  ],
  emergencyRelations: [
    { id: 1, nameTh: "พ่อ" },
    { id: 2, nameTh: "แม่" },
    { id: 3, nameTh: "คู่สมรส" },
    { id: 4, nameTh: "พี่น้อง" },
    { id: 5, nameTh: "เพื่อน" },
    { id: 6, nameTh: "อื่น ๆ" },
  ],
}

export const mockShippingOptions: ShippingOption[] = [
  {
    id: 1,
    type: "Pickup",
    name: "รับเองหน้างาน",
    description: "วันรับบิบ [วันที่] · แสดง QR เช็กอิน",
    fee: 0,
  },
  { id: 2, type: "Post", name: "ส่งทางไปรษณีย์", description: "ส่งกล่องเดียวต่อใบสมัคร", fee: 60 },
]

/**
 * ตัวอย่างรหัสไปรษณีย์ไม่กี่รหัสสำหรับทดสอบ (10110, 10330)
 * ของจริงมาจากตาราง Province/District/Subdistrict ฝั่ง API
 */
export const mockZipIndex: Record<string, ZipMatch[]> = {
  "10110": [
    { subdistrictId: 101, subdistrict: "คลองเตย", district: "คลองเตย", province: "กรุงเทพมหานคร" },
    { subdistrictId: 102, subdistrict: "คลองตัน", district: "คลองเตย", province: "กรุงเทพมหานคร" },
    { subdistrictId: 103, subdistrict: "พระโขนง", district: "คลองเตย", province: "กรุงเทพมหานคร" },
    {
      subdistrictId: 104,
      subdistrict: "คลองเตยเหนือ",
      district: "วัฒนา",
      province: "กรุงเทพมหานคร",
    },
    {
      subdistrictId: 105,
      subdistrict: "คลองตันเหนือ",
      district: "วัฒนา",
      province: "กรุงเทพมหานคร",
    },
    {
      subdistrictId: 106,
      subdistrict: "พระโขนงเหนือ",
      district: "วัฒนา",
      province: "กรุงเทพมหานคร",
    },
  ],
  "10330": [
    { subdistrictId: 201, subdistrict: "รองเมือง", district: "ปทุมวัน", province: "กรุงเทพมหานคร" },
    { subdistrictId: 202, subdistrict: "วังใหม่", district: "ปทุมวัน", province: "กรุงเทพมหานคร" },
    { subdistrictId: 203, subdistrict: "ปทุมวัน", district: "ปทุมวัน", province: "กรุงเทพมหานคร" },
    { subdistrictId: 204, subdistrict: "ลุมพินี", district: "ปทุมวัน", province: "กรุงเทพมหานคร" },
  ],
}

/** โค้ดทดสอบ: EARLY10 ลด ฿50, ALUMNI10 ลด 10%, FULL20 = ใช้ครบแล้ว */
export const mockPromos: Record<
  string,
  { type: "fixed" | "percent"; value: number } | "exhausted"
> = {
  EARLY10: { type: "fixed", value: 50 },
  ALUMNI10: { type: "percent", value: 10 },
  FULL20: "exhausted",
}
