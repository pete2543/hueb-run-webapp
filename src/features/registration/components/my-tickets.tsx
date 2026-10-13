"use client"

import { ChevronRight, PackageCheck, Ticket, Truck, Users, Wallet } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { liffReturnKey } from "@/components/liff-return"
import { Mascot } from "@/components/mascot"
import { formatBaht, formatThaiDate } from "@/lib/format"
import { getMyOrders } from "../actions"
import type { MyOrder, OrderStatus } from "../types"

const liffId = process.env.NEXT_PUBLIC_LIFF_ID

type State =
  | { kind: "loading" }
  | { kind: "needLogin" }
  | { kind: "ready"; orders: MyOrder[] }
  | { kind: "error"; message: string }

/**
 * หน้า "ตั๋วของฉัน": login LINE ผ่าน LIFF → ส่ง ID token ให้ API คืนใบสมัครที่ผูกกับ LINE นี้
 * เปิดจาก rich menu ผ่าน https://liff.line.me/{LIFF_ID}/my-tickets จะ login ให้อัตโนมัติในแอป LINE
 * ตั๋ว/QR ใช้หน้าสมัครสำเร็จเดิม (/register/success/{orderId}) ไม่ทำซ้ำที่นี่
 */
export function MyTickets() {
  const [state, setState] = useState<State>({ kind: "loading" })

  const load = useCallback(async (forceLogin = false) => {
    setState({ kind: "loading" })
    try {
      let idToken = ""
      if (liffId) {
        const liff = (await import("@line/liff")).default
        await liff.init({ liffId })
        if (forceLogin && liff.isLoggedIn()) liff.logout()
        if (!liff.isLoggedIn()) {
          // ในแอป LINE login ได้ทันที; เบราว์เซอร์ภายนอกให้ผู้ใช้กดเอง (ไม่เด้งไปหน้า LINE ทันทีที่เปิด)
          if (liff.isInClient() || forceLogin) {
            sessionStorage.removeItem(liffReturnKey)
            liff.login({ redirectUri: window.location.origin + window.location.pathname })
          } else {
            setState({ kind: "needLogin" })
          }
          return
        }
        idToken = liff.getIDToken() ?? ""
      }
      const res = await getMyOrders(idToken)
      if (res.ok) setState({ kind: "ready", orders: res.data })
      else if (res.code === "INVALID_LINE_TOKEN" && liffId)
        setState({ kind: "needLogin" }) // token หมดอายุ
      else if (res.code === "INVALID_LINE_TOKEN")
        setState({ kind: "error", message: "ยังไม่ได้เปิดใช้การเข้าสู่ระบบด้วย LINE" })
      // error ที่ไม่มีรหัสจาก API (เช่น 404/502 ของเซิร์ฟเวอร์) ข้อความเป็นภาษาอังกฤษ ไม่แสดงตรง ๆ
      else if (res.code === "UNKNOWN" || res.code === "NETWORK")
        setState({ kind: "error", message: "ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้งภายหลัง" })
      else setState({ kind: "error", message: res.message })
    } catch (e) {
      console.error("load my orders failed", e)
      setState({ kind: "error", message: "เชื่อมต่อ LINE ไม่ได้ กรุณาลองใหม่อีกครั้ง" })
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => load())
  }, [load])

  if (state.kind === "loading") {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="กำลังโหลดใบสมัคร">
        <div className="h-36 animate-pulse rounded-3xl bg-muted" />
        <div className="h-36 animate-pulse rounded-3xl bg-muted" />
      </div>
    )
  }

  if (state.kind === "needLogin") {
    return (
      <Notice pose="pointing" title="เข้าสู่ระบบด้วย LINE เพื่อดูตั๋ว">
        <p>ใช้บัญชี LINE เดียวกับที่เชื่อมต่อไว้ตอนสมัคร</p>
        <button
          type="button"
          onClick={() => void load(true)}
          className="flex min-h-12 items-center justify-center rounded-2xl bg-[#06C755] px-8 font-heading font-semibold text-white hover:opacity-90"
        >
          เข้าสู่ระบบด้วย LINE
        </button>
      </Notice>
    )
  }

  if (state.kind === "error") {
    return (
      <Notice pose="wai" title="โหลดใบสมัครไม่สำเร็จ">
        <p role="alert">{state.message}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-primary/25 px-8 font-semibold text-primary hover:bg-muted"
        >
          ลองใหม่
        </button>
      </Notice>
    )
  }

  if (state.orders.length === 0) {
    return (
      <Notice pose="thinking" title="ยังไม่พบใบสมัครที่เชื่อมกับ LINE นี้">
        <p>
          ถ้าสมัครแล้ว ให้เปิดลิงก์หน้าชำระเงินหรือหน้าสมัครสำเร็จ แล้วกด &quot;เชื่อมต่อ LINE&quot;
          ใบสมัครจะขึ้นที่นี่
        </p>
        <Link
          href="/register"
          className="flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 font-heading font-semibold text-primary-foreground hover:bg-primary/90"
        >
          สมัครวิ่ง
        </Link>
      </Notice>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {state.orders.map((order) => (
        <li key={order.orderId}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  )
}

const statusView: Record<OrderStatus, { label: string; className: string }> = {
  Paid: { label: "ชำระแล้ว", className: "bg-primary/10 text-primary" },
  Pending: { label: "รอชำระเงิน", className: "bg-caution/15 text-caution" },
  Refunded: { label: "คืนเงินแล้ว", className: "bg-muted text-muted-foreground" },
  Expired: { label: "หมดเวลา", className: "bg-muted text-muted-foreground" },
  Cancelled: { label: "ยกเลิก", className: "bg-muted text-muted-foreground" },
}

function OrderCard({ order }: { order: MyOrder }) {
  const status = statusView[order.status]
  return (
    <article className="flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{order.eventName}</p>
          <h2 className="font-heading text-xl font-bold tabular-nums">{order.orderNo}</h2>
          <p className="text-xs text-muted-foreground">
            สมัครเมื่อ {formatThaiDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </header>

      <dl className="flex flex-wrap gap-2 text-sm">
        <Chip icon={Users} label="นักวิ่ง" value={`${order.runnerCount} คน`} />
        <Chip icon={Wallet} label="ยอด" value={formatBaht(order.total)} />
        <Chip
          icon={PackageCheck}
          label="รับของ"
          value={order.deliveryType === "Post" ? "ส่งไปรษณีย์" : "รับเองหน้างาน"}
        />
        {order.trackingNo ? <Chip icon={Truck} label="เลขพัสดุ" value={order.trackingNo} /> : null}
      </dl>

      {order.status === "Paid" ? (
        <CardLink href={`/register/success/${order.orderId}`} primary>
          <Ticket className="size-5" aria-hidden />
          ดูบัตรนักวิ่ง & QR เช็กอิน
        </CardLink>
      ) : order.status === "Pending" ? (
        <CardLink href={`/register/payment/${order.orderId}`}>ไปชำระเงิน / ดูสถานะสลิป</CardLink>
      ) : null}
    </article>
  )
}

function CardLink({
  href,
  primary,
  children,
}: {
  href: string
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-heading font-semibold text-primary-foreground hover:bg-primary/90"
          : "flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary/25 px-6 font-semibold text-primary hover:bg-muted"
      }
    >
      {children}
      <ChevronRight className="size-5" aria-hidden />
    </Link>
  )
}

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
      <Icon className="size-4 text-primary" aria-hidden />
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

function Notice({
  pose,
  title,
  children,
}: {
  pose: "pointing" | "thinking" | "wai"
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-3xl border bg-white px-5 py-8 text-center">
      <Mascot pose={pose} sizes="140px" className="h-auto w-28" />
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <div className="flex max-w-md flex-col items-center gap-4 text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
