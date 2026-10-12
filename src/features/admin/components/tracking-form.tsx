"use client"

import { useState, useTransition } from "react"
import { setTracking } from "../api/actions"

/** ใส่/แก้/ล้างเลขพัสดุ (ว่าง = ล้าง) */
export function TrackingForm({ orderId, initial }: { orderId: string; initial: string | null }) {
  const [value, setValue] = useState(initial ?? "")
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setMsg(null)
        start(async () => {
          const res = await setTracking(orderId, value)
          setMsg(res.ok ? { ok: true, text: "บันทึกแล้ว" } : { ok: false, text: res.error })
        })
      }}
      className="mt-3 flex flex-col gap-2"
    >
      <label htmlFor="tracking" className="text-sm font-medium">
        เลขพัสดุ
      </label>
      <div className="flex gap-2">
        <input
          id="tracking"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={50}
          placeholder="เช่น EY123456789TH"
          className="h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"
        />
        <button disabled={pending} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
          บันทึก
        </button>
      </div>
      {msg ? (
        <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>
          {msg.text}
        </p>
      ) : null}
    </form>
  )
}
