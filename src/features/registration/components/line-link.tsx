"use client"

import { BellRing, CheckCircle2, Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { linkLine } from "../actions"

const liffId = process.env.NEXT_PUBLIC_LIFF_ID
const lineOaUrl = process.env.NEXT_PUBLIC_LINE_OA_URL || "#"

type State = "idle" | "working" | "linked" | "needFriend" | "error"

const messages: Record<string, string> = {
  INVALID_LINE_TOKEN: "ยืนยันตัวตนกับ LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  LINE_ALREADY_LINKED: "ใบสมัครนี้ผูกกับบัญชี LINE อื่นแล้ว",
  ORDER_CLOSED: "ใบสมัครนี้หมดเวลาหรือถูกยกเลิกแล้ว ผูก LINE ไม่ได้",
}

/**
 * ผูก LINE กับใบสมัครผ่าน LIFF: login LINE → ได้ ID token → ส่งให้ API ผูกกับออเดอร์
 * หลัง login LINE จะพากลับมาหน้านี้ จึงจำไว้ใน sessionStorage ว่ากำลังผูกอยู่เพื่อทำต่ออัตโนมัติ
 * ได้ข้อความเฉพาะคนที่เป็นเพื่อนกับ OA ด้วย — ถ้ายังไม่เป็นเพื่อนจะชวนเพิ่มเพื่อน
 */
export function LineLink({ orderId }: { orderId: string }) {
  const pendingKey = `line-link:${orderId}`
  const doneKey = `line-linked:${orderId}`
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    if (!liffId) return
    setState("working")
    setError(null)
    try {
      const liff = (await import("@line/liff")).default
      await liff.init({ liffId })
      if (!liff.isLoggedIn()) {
        sessionStorage.setItem(pendingKey, "1")
        liff.login({ redirectUri: window.location.href })
        return
      }
      sessionStorage.removeItem(pendingKey)
      const idToken = liff.getIDToken()
      if (!idToken) throw new Error("no id token")
      const res = await linkLine(orderId, idToken)
      if (!res.ok) {
        setError(messages[res.code] ?? "ผูก LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
        setState("error")
        return
      }
      localStorage.setItem(doneKey, "1")
      // ถ้าเช็กสถานะเพื่อนไม่ได้ (ไม่ได้ผูก OA กับ LINE Login) ถือว่าเป็นเพื่อนแล้ว ไม่รบกวนซ้ำ
      const friend = await liff.getFriendship().then((f) => f.friendFlag).catch(() => true)
      setState(friend ? "linked" : "needFriend")
    } catch {
      setError("เชื่อมต่อ LINE ไม่ได้ กรุณาลองใหม่อีกครั้ง")
      setState("error")
    }
  }, [orderId, pendingKey, doneKey])

  useEffect(() => {
    if (!liffId) return
    // อ่าน storage ได้เฉพาะฝั่ง browser จึงตั้งสถานะหลัง mount (เลื่อนออกจาก effect body กัน render ซ้อน)
    if (localStorage.getItem(doneKey)) void Promise.resolve().then(() => setState("linked"))
    else if (sessionStorage.getItem(pendingKey)) void Promise.resolve().then(run)
  }, [doneKey, pendingKey, run])

  if (!liffId) return null

  return (
    <section className="flex flex-col gap-3 rounded-3xl border bg-white p-5 sm:p-6" aria-labelledby="line-link-heading">
      <h2 id="line-link-heading" className="flex items-center gap-2 font-heading text-lg font-semibold">
        <BellRing className="size-5 text-[#06C755]" aria-hidden /> รับแจ้งเตือนทาง LINE
      </h2>
      {state === "linked" ? (
        <p role="status" className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="size-5" aria-hidden /> เชื่อมต่อ LINE แล้ว จะแจ้งผลการชำระเงินและข่าวสารผ่าน LINE
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            เชื่อมต่อ LINE กับใบสมัครนี้ เพื่อรับแจ้งผลตรวจสลิป เลขพัสดุ และประกาศสำคัญจากผู้จัด (ต้องเป็นเพื่อนกับ LINE OA ด้วย)
          </p>
          <button
            type="button"
            onClick={() => void run()}
            disabled={state === "working"}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#06C755] px-6 font-heading font-semibold text-white hover:opacity-90 disabled:opacity-60 sm:w-fit"
          >
            {state === "working" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
            {state === "working" ? "กำลังเชื่อมต่อ…" : "เชื่อมต่อ LINE"}
          </button>
        </>
      )}
      {state === "needFriend" ? (
        <div role="status" className="flex flex-col gap-2 rounded-xl bg-caution/10 p-3 text-sm">
          <p>เชื่อมต่อแล้ว แต่ยังไม่ได้เป็นเพื่อนกับ LINE OA จึงยังไม่ได้รับข้อความ กรุณาเพิ่มเพื่อน</p>
          <a href={lineOaUrl} target="_blank" rel="noreferrer" className="w-fit font-semibold text-primary underline underline-offset-4">
            เพิ่มเพื่อน LINE OA
          </a>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  )
}
