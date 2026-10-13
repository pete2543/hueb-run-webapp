import { mockDistances, mockShippingOptions, mockShirtSizes } from "./mocks"
import type { MyOrder, OrderSummary, OrderTickets, Ticket } from "./types"

/**
 * ที่เก็บออเดอร์จำลองในหน่วยความจำของเซิร์ฟเวอร์ (ใช้เมื่อ API_MOCK) หายเมื่อรีสตาร์ต
 * จำลองงานเบื้องหลังของ API: หมดเวลาแล้วเป็น Expired, ส่งสลิปแล้ว ~4 วินาทีเป็น Paid
 */

type MockRunner = { firstName: string; lastName: string; distanceId: number; shirtSizeId: number }

type MockOrder = OrderSummary & {
  slipUploadedAt: number | null
  runners: MockRunner[]
  shippingOptionId: number
  tickets: Ticket[] | null
}

const store = ((globalThis as { __mockOrders?: Map<string, MockOrder> }).__mockOrders ??= new Map())

/** ใช้ทดสอบ: ส่งไฟล์ชื่อมี "reject" → สลิปไม่ผ่าน, "review" → ส่งให้เจ้าหน้าที่ตรวจ */
const verifyDelayMs = 4000

export function saveMockOrder(order: Omit<MockOrder, "slipUploadedAt" | "tickets">) {
  store.set(order.orderId, { ...order, slipUploadedAt: null, tickets: null })
}

/** เลขบิบรันต่อระยะ (API จริงออกเลขใน transaction เดียวกับตอนยืนยันเงิน) */
const bibCounters = ((globalThis as { __mockBibs?: Map<number, number> }).__mockBibs ??= new Map())
const bibPrefix: Record<number, string> = { 1: "A", 2: "B", 3: "C" }

function issueTickets(order: MockOrder): Ticket[] {
  return order.runners.map((runner, i) => {
    const distance = mockDistances.find((d) => d.id === runner.distanceId)
    const next = (bibCounters.get(runner.distanceId) ?? 100) + 1
    bibCounters.set(runner.distanceId, next)
    return {
      registrationId: i + 1,
      bibNumber: `${bibPrefix[runner.distanceId] ?? "X"}${String(next).padStart(4, "0")}`,
      firstName: runner.firstName,
      lastName: runner.lastName,
      distanceName: distance?.name ?? "",
      distanceKm: distance?.distanceKm ?? 0,
      shirtSize: mockShirtSizes.find((s) => s.id === runner.shirtSizeId)?.size ?? "",
      checkInToken: crypto.randomUUID().replaceAll("-", ""),
    }
  })
}

export function getMockTickets(orderId: string): OrderTickets | null {
  const summary = getMockOrder(orderId)
  const order = store.get(orderId)
  if (!summary || !order || summary.status !== "Paid") return null
  order.tickets ??= issueTickets(order)
  const shipping = mockShippingOptions.find((o) => o.id === order.shippingOptionId)
  return {
    orderNo: order.orderNo,
    total: order.total,
    deliveryType: shipping?.type ?? "Pickup",
    tickets: order.tickets,
  }
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
    order.rejectReason = "AMOUNT_MISMATCH"
  } else if (/review/i.test(fileName)) {
    order.paymentStatus = "NeedsReview"
  } else {
    order.paymentStatus = "Verifying"
    order.slipUploadedAt = Date.now()
  }
}

/** ออเดอร์จำลองทั้งหมดที่ยังไม่หมดเวลา (โหมดจำลองไม่มี LINE จริง จึงถือว่าทุกออเดอร์เป็นของคนที่เปิดดู) */
export function listMockOrders(eventName: string): MyOrder[] {
  return [...store.values()]
    .map((order) => ({ order, summary: getMockOrder(order.orderId)! }))
    .filter(({ summary }) => summary.status !== "Expired" && summary.status !== "Cancelled")
    .map(({ order, summary }) => ({
      orderId: order.orderId,
      orderNo: order.orderNo,
      eventName,
      status: summary.status,
      total: order.total,
      runnerCount: order.runners.length,
      deliveryType: mockShippingOptions.find((o) => o.id === order.shippingOptionId)?.type ?? "Pickup",
      trackingNo: null,
      // ออเดอร์จำลองไม่เก็บเวลาสร้าง ใช้เวลาหมดอายุ - 30 นาที
      createdAt: new Date(Date.parse(order.expiresAt) - 30 * 60 * 1000).toISOString(),
    }))
    .reverse()
}
