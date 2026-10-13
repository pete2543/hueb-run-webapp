/**
 * รูป response ดิบจาก ASP.NET Core API (hueb-run-webapi/src/HuebRun.Api/Contracts)
 * ใช้เฉพาะใน api.ts / actions.ts เพื่อแปลงเป็น type ที่หน้าเว็บใช้ (types.ts)
 */

export type ApiEvent = {
  id: number
  slug: string
  name: string
  year: number
  eventDate: string
  registrationOpensAt: string
  registrationClosesAt: string
  registrationOpen: boolean
}

export type ApiDistance = {
  id: number
  name: string
  distanceKm: number
  price: number
  regularPrice: number
  isEarlyBird: boolean
  earlyBirdEndsAt: string | null
  quota: number
  remaining: number
}

export type ApiShirtSize = { id: number; size: string; detail: string | null; remaining: number }

export type ApiShippingOption = { id: number; type: "Pickup" | "Post"; name: string; fee: number }

type GeoRef = { id: number; nameTh: string }

export type ApiZipMatch = {
  subdistrict: GeoRef
  district: GeoRef
  province: GeoRef
  zipCode: string
}

export type ApiPromoQuote = { code: string; subTotal: number; discountAmount: number }

export type ApiOrder = {
  orderId: string
  orderNo: string
  status: import("./types").OrderStatus
  subTotal: number
  discountAmount: number
  shippingFee: number
  total: number
  payableAmount: number
  createdAt: string
  expiresAt: string
  paidAt: string | null
  promoCode: string | null
  shipping: { type: "Pickup" | "Post"; name: string }
  /** ได้รับแจ้งเตือน LINE เมื่อ linked และ following (API เวอร์ชันเก่าไม่มีฟิลด์นี้) */
  line?: { linked: boolean; following: boolean }
  runners: {
    registrationId: number
    firstName: string
    lastName: string
    distance: { id: number; name: string }
    shirtSize: { id: number; size: string }
    bibNumber: string | null
  }[]
  payment: {
    paymentId: number
    status: import("./types").PaymentStatus
    rejectReason: string | null
  } | null
}

export type ApiTicket = {
  registrationId: number
  firstName: string
  lastName: string
  distanceName: string
  bibNumber: string
  checkInToken: string
}

export type ApiPaymentInfo = {
  orderId: string
  orderNo: string
  amount: number
  accountName: string
  qrPayload: string
  expiresAt: string
}
