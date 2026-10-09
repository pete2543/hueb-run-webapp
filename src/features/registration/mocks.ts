import type { Distance, EventInfo, Lookups, ShirtSize } from "./types"

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
