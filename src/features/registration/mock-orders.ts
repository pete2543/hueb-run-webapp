import type { OrderSummary } from "./types"

/**
 * ที่เก็บออเดอร์จำลองในหน่วยความจำของเซิร์ฟเวอร์ (ใช้เมื่อ API_MOCK) หายเมื่อรีสตาร์ต
 * จำลองงานเบื้องหลังของ API: หมดเวลาแล้วเป็น Expired, ส่งสลิปแล้ว ~4 วินาทีเป็น Paid
 */

type MockOrder = OrderSummary & { slipUploadedAt: number | null }

const store = ((globalThis as { __mockOrders?: Map<string, MockOrder> }).__mockOrders ??= new Map())

/** ใช้ทดสอบ: ส่งไฟล์ชื่อมี "reject" → สลิปไม่ผ่าน, "review" → ส่งให้เจ้าหน้าที่ตรวจ */
const verifyDelayMs = 4000

export function saveMockOrder(order: Omit<MockOrder, "slipUploadedAt">) {
  store.set(order.orderId, { ...order, slipUploadedAt: null })
}

export function countMockOrders() {
  return store.size
}

export function getMockOrder(orderId: string): OrderSummary | null {
  const order = store.get(orderId)
  if (!order) return null
  const now = Date.now()
  if (
    order.status === "Pending" &&
    (order.paymentStatus === "Pending" || order.paymentStatus === "Rejected") &&
    now > Date.parse(order.expiresAt)
  ) {
    order.status = "Expired"
  }
  if (
    order.paymentStatus === "Verifying" &&
    order.slipUploadedAt &&
    now - order.slipUploadedAt > verifyDelayMs
  ) {
    order.paymentStatus = "Verified"
    order.status = "Paid"
  }
  return {
    orderId: order.orderId,
    orderNo: order.orderNo,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    payableAmount: order.payableAmount,
    expiresAt: order.expiresAt,
    rejectReason: order.rejectReason,
  }
}

export function markMockSlip(orderId: string, fileName: string) {
  const order = store.get(orderId)
  if (!order) return
  order.rejectReason = null
  if (/reject/i.test(fileName)) {
    order.paymentStatus = "Rejected"
    order.rejectReason = "ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องโอน"
  } else if (/review/i.test(fileName)) {
    order.paymentStatus = "NeedsReview"
  } else {
    order.paymentStatus = "Verifying"
    order.slipUploadedAt = Date.now()
  }
}
