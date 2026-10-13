"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { cancelBroadcast, saveBroadcast, sendBroadcast } from "../api/actions"
import type { BroadcastItem } from "../api/types"

const field = "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"
const btn = "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium disabled:opacity-50"
const primary = `${btn} border-transparent bg-primary text-primary-foreground`

type Distance = { id: number; name: string }

/** สร้าง/แก้ร่างประกาศ (แก้ได้เฉพาะสถานะ Draft) */
export function BroadcastForm({
  eventId,
  distances,
  broadcast,
  onDone,
}: {
  eventId: number
  distances: Distance[]
  broadcast?: BroadcastItem
  onDone?: () => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const f = new FormData(form)
        const distance = String(f.get("distance") ?? "")
        setError(null)
        start(async () => {
          const res = await saveBroadcast(eventId, broadcast?.id ?? null, {
            title: String(f.get("title")).trim(),
            body: String(f.get("body")).trim(),
            audienceDistanceId: distance ? Number(distance) : null,
            onlyPaid: f.get("onlyPaid") === "on",
          })
          if (!res.ok) return setError(res.error)
          if (!broadcast) form.reset()
          onDone?.()
          router.refresh()
        })
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        หัวข้อ
        <input name="title" required maxLength={100} defaultValue={broadcast?.title} placeholder="เช่น แจ้งเลื่อนเวลาปล่อยตัว" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        ข้อความ
        <textarea name="body" required maxLength={2000} rows={5} defaultValue={broadcast?.body} className="w-full rounded-lg border bg-white p-3 text-sm outline-none focus:border-primary" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          ส่งถึงนักวิ่งระยะ
          <select name="distance" defaultValue={broadcast?.audienceDistanceId ?? ""} className={field}>
            <option value="">ทุกระยะ</option>
            {distances.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" name="onlyPaid" defaultChecked={broadcast?.onlyPaid ?? true} className="size-4" />
          เฉพาะคนที่จ่ายเงินแล้ว
        </label>
      </div>
      <div className="flex gap-2">
        <button disabled={pending} className={primary}>
          {broadcast ? "บันทึกการแก้ไข" : "บันทึกเป็นร่าง"}
        </button>
        {broadcast ? (
          <button type="button" onClick={onDone} className={btn}>
            ยกเลิก
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}

/** วันเวลาจาก <input datetime-local> (เวลาไทย) → ISO UTC; ต้องเป็นอนาคต */
function bangkokToIso(local: string) {
  const t = Date.parse(`${local}:00+07:00`)
  return Number.isNaN(t) ? null : new Date(t).toISOString()
}

/** ปุ่มของแต่ละประกาศตามสถานะ: ร่าง → แก้/ส่ง · Scheduled/Sending → ยกเลิก */
export function BroadcastActions({
  broadcast,
  eventId,
  distances,
}: {
  broadcast: BroadcastItem
  eventId: number
  distances: Distance[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"edit" | "send" | null>(null)
  const [when, setWhen] = useState("")

  const recipients = broadcast.audience?.recipients ?? 0

  function run(task: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null)
    start(async () => {
      const res = await task()
      if (!res.ok) setError(res.error ?? "ทำรายการไม่สำเร็จ")
      else setMode(null)
      router.refresh()
    })
  }

  function send() {
    const iso = when ? bangkokToIso(when) : null
    if (when && (!iso || Date.parse(iso) <= Date.now())) return setError("เวลาที่ตั้งต้องเป็นอนาคต")
    run(() => sendBroadcast(broadcast.id, recipients, iso ?? undefined))
  }

  if (broadcast.status === "Scheduled" || broadcast.status === "Sending") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("ยกเลิกประกาศนี้? ข้อความที่ยังไม่ส่งจะถูกข้าม (ที่ส่งไปแล้วเรียกคืนไม่ได้)")) run(() => cancelBroadcast(broadcast.id))
          }}
          className={`${btn} w-fit text-destructive hover:bg-destructive/5`}
        >
          ยกเลิกการส่ง
        </button>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      </div>
    )
  }
  if (broadcast.status !== "Draft") return null

  if (mode === "edit") {
    return <BroadcastForm eventId={eventId} distances={distances} broadcast={broadcast} onDone={() => setMode(null)} />
  }

  return (
    <div className="flex flex-col gap-3">
      {broadcast.audience ? (
        <div className="rounded-xl bg-muted/50 p-3 text-sm">
          <p>
            ส่งถึงได้จริง <strong className="text-base">{recipients.toLocaleString("th-TH")}</strong> คน จากใบสมัครที่เข้าเงื่อนไข{" "}
            {broadcast.audience.targetOrders.toLocaleString("th-TH")} ใบ
          </p>
          {broadcast.audience.targetOrders > recipients ? (
            <p className="mt-1 text-xs text-muted-foreground">
              ส่วนที่ส่งไม่ถึง: ยังไม่ผูก LINE กับใบสมัคร หรือไม่ได้เป็นเพื่อนกับ OA (คนเดียวที่มีหลายใบสมัครนับเป็นหนึ่งคน)
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => setMode("edit")} className={btn}>
          แก้ไข
        </button>
        <button type="button" disabled={pending || recipients === 0} onClick={() => setMode(mode === "send" ? null : "send")} className={primary}>
          ส่งประกาศ
        </button>
      </div>
      {mode === "send" ? (
        <div className="flex flex-col gap-2 rounded-xl border p-3">
          <p className="text-sm">
            ยืนยันส่งถึง <strong>{recipients.toLocaleString("th-TH")}</strong> คน
          </p>
          <label className="flex flex-col gap-1 text-sm">
            ตั้งเวลาส่ง (เวลาไทย ไม่บังคับ — เว้นว่าง = ส่งทันที)
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${field} sm:w-64`} />
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={send} className={primary}>
              {when ? "ตั้งเวลาส่ง" : "ส่งเลย"}
            </button>
            <button type="button" onClick={() => setMode(null)} className={btn}>
              ยกเลิก
            </button>
          </div>
          <p className="text-xs text-muted-foreground">ส่งแล้วแก้ไขหรือเรียกคืนไม่ได้ · ข้อความนับโควตารายเดือนของแพ็กเกจ OA</p>
        </div>
      ) : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

/** ฟอร์มสร้างประกาศใหม่ แบบพับเก็บ */
export function NewBroadcast({ eventId, distances }: { eventId: number; distances: Distance[] }) {
  const [open, setOpen] = useState(false)
  return open ? (
    <div className="rounded-2xl border bg-white p-4 sm:p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold">ประกาศใหม่</h2>
      <BroadcastForm eventId={eventId} distances={distances} onDone={() => setOpen(false)} />
    </div>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className={`${primary} h-10 w-fit px-4`}>
      + เขียนประกาศ
    </button>
  )
}
