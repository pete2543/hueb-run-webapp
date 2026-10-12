import type { AdminRole } from "../auth/access"

/** รูปแบบข้อมูลตาม docs/admin-api-frontend-guide.md ของ API */

export type Page<T> = { items: T[]; page: number; pageSize: number; total: number }

export type AdminUserDto = {
  id: string
  name: string
  email: string
  role: AdminRole
  isActive: boolean
  eventIds: number[]
  createdAt: string
  lastLoginAt: string | null
}

export type LoginResponse = { token: string; expiresAt: string; user: AdminUserDto }

export type PaymentStatus = "Pending" | "Verifying" | "NeedsReview" | "Verified" | "Rejected"
export type OrderStatus = "Pending" | "Paid" | "Expired" | "Cancelled" | "Refunded"

export type PaymentItem = {
  paymentId: number
  orderId: string
  orderNo: string
  orderStatus: OrderStatus
  contactName: string
  phone: string
  runnerCount: number
  expectedAmount: number
  paidAmount: number | null
  status: PaymentStatus
  rejectReason: string | null
  reviewNote: string | null
  createdAt: string
  transferredAt: string | null
  reviewedBy: string | null
}

export type OrderListItem = {
  orderId: string
  orderNo: string
  status: OrderStatus
  contactName: string
  phone: string
  runnerCount: number
  total: number
  payableAmount: number
  latestPaymentStatus: PaymentStatus | null
  latestPaymentReason: string | null
  createdAt: string
  expiresAt: string
  paidAt: string | null
}

export type OrderDetail = {
  orderId: string
  orderNo: string
  eventId: number
  status: OrderStatus
  contactName: string
  phone: string
  email: string | null
  subTotal: number
  discountAmount: number
  shippingFee: number
  total: number
  payableAmount: number
  promoCode: string | null
  createdAt: string
  expiresAt: string
  paidAt: string | null
  shipping: {
    name: string
    type: "Pickup" | "Post"
    fee: number
    trackingNo: string | null
    shipName: string | null
    shipPhone: string | null
    address: string | null
  }
  registrations: {
    id: number
    firstName: string
    lastName: string
    distance: string
    shirtSize: string
    bibNumber: string | null
    pricePaid: number
    teamName: string | null
    isCancelled: boolean
    checkedInAt: string | null
    gender: string | null
    birthDate: string | null
    phone: string | null
    email: string | null
    idCardOrPassport: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    medicalNote: string | null
  }[]
  payments: {
    paymentId: number
    status: PaymentStatus
    rejectReason: string | null
    reviewNote: string | null
    expectedAmount: number
    paidAmount: number | null
    createdAt: string
    transferredAt: string | null
    verifiedAt: string | null
    reviewedBy: string | null
  }[]
}

export type Dashboard = {
  eventId: number
  asOf: string
  orders: {
    total: number
    paid: number
    pending: number
    expired: number
    cancelled: number
    refunded: number
  }
  paidRunners: number
  pendingRunners: number
  payments: { needsReview: number; verifying: number }
  revenue: { paid: number; pendingAmount: number }
  distances: {
    id: number
    name: string
    quota: number
    reserved: number
    remaining: number
    paidRunners: number
    pendingRunners: number
  }[]
  shirts: {
    id: number
    size: string
    stock: number
    reserved: number
    remaining: number
    paidRunners: number
  }[]
}

export type EventSettings = {
  id: number
  name: string
  slug: string
  year: number
  eventDate: string
  registrationOpensAt: string
  registrationClosesAt: string
  promptPayId: string
  promptPayAccountName: string
  reservationMinutes: number
  isPublished: boolean
}

export type ListKind = "distances" | "shirt-sizes" | "shipping-options"
