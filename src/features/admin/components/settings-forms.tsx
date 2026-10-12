"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { saveEvent, saveList } from "../api/actions"
import type { EventSettings, ListKind } from "../api/types"

const input = "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground"
const primaryBtn = "h-10 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"

/** API เก็บ UTC แต่แอดมินกรอกเวลาไทย (UTC+7) */
const toLocal = (iso: string | null | undefined) =>
  iso ? new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16) : ""
const toIso = (local: string) => (local ? `${local}:00+07:00` : null)

function Status({ error, done }: { error: string | null; done: string | null }) {
  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>
  if (done) return <p role="status" className="text-sm text-primary">{done}</p>
  return null
}

export function EventForm({ event }: { event: EventSettings }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  function submit(form: HTMLFormElement) {
    const f = new FormData(form)
    setError(null)
    setDone(null)
    start(async () => {
      const res = await saveEvent(event.id, {
        name: String(f.get("name")).trim(),
        eventDate: toIso(String(f.get("eventDate"))),
        registrationOpensAt: toIso(String(f.get("registrationOpensAt"))),
        registrationClosesAt: toIso(String(f.get("registrationClosesAt"))),
        promptPayId: String(f.get("promptPayId")).trim(),
        promptPayAccountName: String(f.get("promptPayAccountName")).trim(),
        reservationMinutes: Number(f.get("reservationMinutes")),
        isPublished: f.get("isPublished") === "on",
      })
      if (!res.ok) return setError(res.error)
      setWarnings(res.data.warnings)
      setDone("บันทึกแล้ว")
    })
  }

  const label = "flex flex-col gap-1.5 text-sm font-medium"
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(e.currentTarget)
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <label className={`${label} sm:col-span-2`}>
        ชื่องาน
        <input name="name" required defaultValue={event.name} className={input} />
      </label>
      <label className={label}>
        วันแข่งขัน
        <input name="eventDate" type="datetime-local" required defaultValue={toLocal(event.eventDate)} className={input} />
      </label>
      <label className={label}>
        เวลาจองในตะกร้า (นาที, 5–240)
        <input name="reservationMinutes" type="number" min={5} max={240} required defaultValue={event.reservationMinutes} className={input} />
      </label>
      <label className={label}>
        เปิดรับสมัคร
        <input name="registrationOpensAt" type="datetime-local" required defaultValue={toLocal(event.registrationOpensAt)} className={input} />
      </label>
      <label className={label}>
        ปิดรับสมัคร
        <input name="registrationClosesAt" type="datetime-local" required defaultValue={toLocal(event.registrationClosesAt)} className={input} />
      </label>
      <label className={label}>
        PromptPay (เบอร์ 10 หลัก หรือเลข 13 หลัก)
        <input name="promptPayId" required defaultValue={event.promptPayId} inputMode="numeric" className={input} />
      </label>
      <label className={label}>
        ชื่อบัญชี PromptPay
        <input name="promptPayAccountName" required defaultValue={event.promptPayAccountName} className={input} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input name="isPublished" type="checkbox" defaultChecked={event.isPublished} className="size-4" />
        เผยแพร่งานนี้ (ต้องมีระยะ ไซซ์ และวิธีรับของที่เปิดใช้อย่างละ 1 รายการ)
      </label>
      {warnings.length ? (
        <ul className="rounded-lg border border-caution/40 bg-caution/10 p-3 text-sm sm:col-span-2">
          {warnings.map((w) => (
            <li key={w}>⚠️ {w}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className={primaryBtn}>{pending ? "กำลังบันทึก…" : "บันทึกข้อมูลงาน"}</button>
        <Status error={error} done={done} />
      </div>
    </form>
  )
}

type Col = {
  key: string
  label: string
  type: "text" | "number" | "datetime" | "select" | "checkbox"
  options?: { value: string; label: string }[]
  /** ฟิลด์ที่เว้นว่างได้ (ส่ง null) */
  optional?: boolean
  step?: string
  width?: string
  /** ล็อกช่องตามแถว เช่น ตัวอักษรบิบหลังออกบิบแล้ว */
  locked?: (row: Row) => boolean
  min?: (row: Row) => number | undefined
}
type Row = Record<string, unknown>

type Config = { kind: ListKind; cols: Col[]; blank: Row; used: (row: Row) => number; usedLabel?: string; hint?: string }

const configs: Record<ListKind, Config> = {
  distances: {
    kind: "distances",
    blank: { name: "", distanceKm: "", bibPrefix: "", quota: "", price: "", earlyBirdPrice: null, earlyBirdEndsAt: null },
    used: (r) => Number(r.reservedCount ?? 0),
    cols: [
      { key: "name", label: "ชื่อระยะ", type: "text", width: "w-44" },
      { key: "distanceKm", label: "กม.", type: "number", step: "0.01", width: "w-20" },
      { key: "bibPrefix", label: "ตัวอักษรบิบ", type: "text", width: "w-24", locked: (r) => Number(r.lastBibNumber ?? 0) > 0 },
      { key: "quota", label: "โควตา", type: "number", width: "w-24", min: (r) => Number(r.reservedCount ?? 0) },
      { key: "price", label: "ราคา", type: "number", step: "0.01", width: "w-24" },
      { key: "earlyBirdPrice", label: "ราคา early bird", type: "number", step: "0.01", optional: true, width: "w-28" },
      { key: "earlyBirdEndsAt", label: "early bird ถึง", type: "datetime", optional: true, width: "w-52" },
    ],
    hint: "ราคาใหม่มีผลกับออเดอร์ใหม่เท่านั้น · early bird ต้องกรอกราคากับวันตัดรอบคู่กัน",
  },
  "shirt-sizes": {
    kind: "shirt-sizes",
    blank: { size: "", detail: null, stock: "" },
    used: (r) => Number(r.reservedCount ?? 0),
    cols: [
      { key: "size", label: "ไซซ์", type: "text", width: "w-24" },
      { key: "detail", label: "รายละเอียด (เช่น อก 38 นิ้ว)", type: "text", optional: true, width: "w-64" },
      { key: "stock", label: "สต็อก", type: "number", width: "w-24", min: (r) => Number(r.reservedCount ?? 0) },
    ],
  },
  "shipping-options": {
    kind: "shipping-options",
    blank: { type: "Pickup", name: "", fee: 0, isActive: true },
    used: () => 0,
    cols: [
      {
        key: "type",
        label: "ประเภท",
        type: "select",
        options: [
          { value: "Pickup", label: "รับเอง" },
          { value: "Post", label: "ส่งไปรษณีย์" },
        ],
        width: "w-36",
      },
      { key: "name", label: "ชื่อวิธีรับ", type: "text", width: "w-48" },
      { key: "fee", label: "ค่าส่ง", type: "number", step: "0.01", width: "w-24" },
      { key: "isActive", label: "เปิดใช้", type: "checkbox", width: "w-16" },
    ],
    hint: "วิธีรับของลบไม่ได้ถ้ามีคนใช้แล้ว ให้ปิดใช้แทน",
  },
}

function cellValue(col: Col, v: unknown): string {
  if (col.type === "datetime") return toLocal(v as string | null)
  return v == null ? "" : String(v)
}

/** ตารางแก้ไขรายการย่อย ส่งชุดเต็มกลับไปเสมอ */
export function ListEditor({ eventId, kind, initial }: { eventId: number; kind: ListKind; initial: Row[] }) {
  const cfg = configs[kind]
  const [rows, setRows] = useState<Row[]>(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const set = (i: number, key: string, value: unknown) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))

  function save() {
    setError(null)
    setDone(null)
    const items = rows.map((r) => {
      const out: Row = {}
      if (r.id != null) out.id = r.id
      for (const c of cfg.cols) {
        const v = r[c.key]
        if (c.type === "checkbox") out[c.key] = Boolean(v)
        else if (c.type === "number") out[c.key] = v === "" || v == null ? (c.optional ? null : 0) : Number(v)
        else if (c.type === "datetime") out[c.key] = v ? v : null
        else out[c.key] = c.optional && !String(v ?? "").trim() ? null : String(v ?? "").trim()
      }
      return out
    })
    start(async () => {
      const res = await saveList(eventId, kind, items)
      if (!res.ok) return setError(res.error)
      setRows(res.data)
      setDone("บันทึกแล้ว")
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              {cfg.cols.map((c) => (
                <th key={c.key} className="px-1.5 pb-2 font-medium">{c.label}</th>
              ))}
              {kind !== "shipping-options" ? <th className="px-1.5 pb-2 font-medium">จองแล้ว</th> : null}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={(r.id as number | undefined) ?? `new-${i}`}>
                {cfg.cols.map((c) => (
                  <td key={c.key} className={`px-1.5 py-1 ${c.width ?? ""}`}>
                    {c.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        aria-label={c.label}
                        checked={Boolean(r[c.key])}
                        onChange={(e) => set(i, c.key, e.target.checked)}
                        className="size-4"
                      />
                    ) : c.type === "select" ? (
                      <select aria-label={c.label} value={String(r[c.key] ?? "")} onChange={(e) => set(i, c.key, e.target.value)} className={input}>
                        {c.options?.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        aria-label={c.label}
                        type={c.type === "datetime" ? "datetime-local" : c.type}
                        step={c.step}
                        min={c.type === "number" ? (c.min?.(r) ?? 0) : undefined}
                        disabled={c.locked?.(r)}
                        title={c.locked?.(r) ? "ออกเลขบิบไปแล้ว แก้ไม่ได้" : undefined}
                        value={cellValue(c, r[c.key])}
                        onChange={(e) =>
                          set(i, c.key, c.type === "datetime" ? toIso(e.target.value) : c.key === "bibPrefix" ? e.target.value.toUpperCase() : e.target.value)
                        }
                        className={input}
                      />
                    )}
                  </td>
                ))}
                {kind !== "shipping-options" ? (
                  <td className="px-1.5 text-muted-foreground">{cfg.used(r)}</td>
                ) : null}
                <td className="px-1.5">
                  {cfg.used(r) > 0 ? null : (
                    <button
                      type="button"
                      aria-label="ลบแถว"
                      onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                      className="flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cfg.hint ? <p className="text-xs text-muted-foreground">{cfg.hint}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRows((rs) => [...rs, { ...cfg.blank }])} className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium hover:bg-muted">
          <Plus className="size-4" aria-hidden /> เพิ่มรายการ
        </button>
        <button type="button" onClick={save} disabled={pending} className={primaryBtn}>
          {pending ? "กำลังบันทึก…" : "บันทึก"}
        </button>
        <Status error={error} done={done} />
      </div>
    </div>
  )
}
