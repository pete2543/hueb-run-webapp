"use client"

import { useEffect } from "react"

const liffId = process.env.NEXT_PUBLIC_LIFF_ID
/** URL ของหน้าที่กด "เชื่อมต่อ LINE" (LineLink ตั้งไว้ก่อน login) */
export const liffReturnKey = "line-link-return"

/**
 * หลัง login LINE ในเบราว์เซอร์ภายนอก LINE จะพากลับมาที่ Endpoint URL ของ LIFF (หน้าแรก) พร้อม liff.state/code
 * ต้องเรียก liff.init ที่หน้านั้นเพื่อจบการ login แล้วพาไปหน้าเดิม — หน้าที่มี LineLink ทำเอง จึงข้าม
 */
export function LiffReturn() {
  useEffect(() => {
    if (!liffId) return
    if (!/[?&](liff\.state|liffClientId|liffRedirectUri)=/.test(window.location.search)) return
    if (/^\/register\/(payment|success)\//.test(window.location.pathname)) return
    void (async () => {
      try {
        const liff = (await import("@line/liff")).default
        await liff.init({ liffId }) // ถ้ามี liff.state SDK จะพาไปหน้านั้นเอง
        const back = sessionStorage.getItem(liffReturnKey)
        if (back && new URL(back).origin === window.location.origin) window.location.replace(back)
      } catch (e) {
        console.error("LIFF return failed", e)
      }
    })()
  }, [])
  return null
}
