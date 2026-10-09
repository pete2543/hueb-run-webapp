import type { Distance } from "./types"

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
