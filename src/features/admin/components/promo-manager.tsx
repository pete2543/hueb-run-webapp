"use client"

import { Pencil, Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { savePromo } from "../api/actions"
import type { Promo } from "../api/types"
import { baht, dateTime } from "../format"

const input = "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground"
const label = "flex flex-col gap-1.5 text-sm font-medium"

/** API เก็บ UTC แต่แอดมินกรอกเวลาไทย (UTC+7) */
const toLocal = (iso: string | null) =>
  iso ? new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16) : ""
const toIso = (local: string) => (local ? `${local}:00+07:00` : null)
const optNumber = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v))

function describe(p: Promo) {
  return p.type === "Percent" ? `ลด ${p.value}%` : `ลด ${baht(p.value)}`
}

export function PromoManager({ eventId, initial }: { eventId: number; initial: Promo[] }) {
  const [promos, setPromos] = useState(initial)
  const [editing, setEditing] = useState<Promo | "new" | null>(null)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(form: HTMLFormElement) {
    const f = new FormData(form)
    const current = editing === "new" ? null : editing
    setError(null)
    start(async () => {
      const res = await savePromo(eventId, current?.id ?? null, {
        code: String(f.get("code") ?? current?.code ?? "").trim(),
        type: String(f.get("type")),
        value: Number(f.get("value")),
        minOrderAmount: optNumber(f.get("minOrderAmount")),
        startsAt: toIso(String(f.get("startsAt"))),
        endsAt: toIso(String(f.get("endsAt"))),
        maxUses: optNumber(f.get("maxUses")),
        isActive: f.get("isActive") === "on",
      })
      if (!res.ok) return setError(res.error)
      setPromos((ps) => (current ? ps.map((p) => (p.id === res.data.id ? res.data : p)) : [res.data, ...ps]))
      setEditing(null)
    })
  }

  function toggle(p: Promo) {
    setError(null)
    start(async () => {
      const res = await savePromo(eventId, p.id, { ...p, isActive: !p.isActive })
      if (!res.ok) return setError(res.error)
      setPromos((ps) => ps.map((x) => (x.id === p.id ? res.data : x)))
    })
  }

  const current = editing === "new" ? null : editing

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setError(null)
            setEditing("new")
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" aria-hidden /> สร้างโค้ดใหม่
        </button>
        {!editing && error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      </div>

      {editing ? (
        <form
          key={current?.id ?? "new"}
          onSubmit={(e) => {
            e.preventDefault()
            submit(e.currentTarget)
          }}
          className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <label className={label}>
            โค้ด (A-Z 0-9 _ - ยาว 3–30)
            <input name="code" required={!current} disabled={!!current} defaultValue={current?.code} placeholder="EARLY10" className={`${input} uppercase`} />
          </label>
          <label className={label}>
            ประเภทส่วนลด
            <select name="type" defaultValue={current?.type ?? "Percent"} className={input}>
              <option value="Percent">เปอร์เซ็นต์ (%)</option>
              <option value="Fixed">จำนวนเงิน (บาท)</option>
            </select>
          </label>
          <label className={label}>
            ค่าส่วนลด
            <input name="value" type="number" step="0.01" min={0.01} required defaultValue={current?.value} className={input} />
          </label>
          <label className={label}>
            ยอดขั้นต่ำ (บาท · ว่าง = ไม่จำกัด)
            <input name="minOrderAmount" type="number" step="0.01" min={0} defaultValue={current?.minOrderAmount ?? ""} className={input} />
          </label>
          <label className={label}>
            จำนวนสิทธิ์ (ว่าง = ไม่จำกัด)
            <input name="maxUses" type="number" min={current?.usedCount ?? 1} defaultValue={current?.maxUses ?? ""} className={input} />
          </label>
          <span />
          <label className={label}>
            เริ่มใช้ได้
            <input name="startsAt" type="datetime-local" defaultValue={toLocal(current?.startsAt ?? null)} className={input} />
          </label>
          <label className={label}>
            หมดอายุ
            <input name="endsAt" type="datetime-local" defaultValue={toLocal(current?.endsAt ?? null)} className={input} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input name="isActive" type="checkbox" defaultChecked={current?.isActive ?? true} className="size-4" />
            เปิดใช้งาน
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
            <button disabled={pending} className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {pending ? "กำลังบันทึก…" : "บันทึก"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-lg border px-4 text-sm hover:bg-muted">
              ยกเลิก
            </button>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <p className="w-full text-xs text-muted-foreground">แก้ไขมีผลกับออเดอร์ใหม่เท่านั้น · โค้ดไม่ลบ ให้ปิดใช้งานแทน</p>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-176 text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="p-3 font-medium">โค้ด</th>
              <th className="p-3 font-medium">ส่วนลด</th>
              <th className="p-3 font-medium">ใช้แล้ว</th>
              <th className="p-3 font-medium">ช่วงเวลา</th>
              <th className="p-3 font-medium">สถานะ</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-mono font-semibold">{p.code}</td>
                <td className="p-3">
                  {describe(p)}
                  {p.minOrderAmount ? <span className="block text-xs text-muted-foreground">ขั้นต่ำ {baht(p.minOrderAmount)}</span> : null}
                </td>
                <td className="p-3">
                  {p.usedCount}
                  {p.maxUses != null ? ` / ${p.maxUses}` : " (ไม่จำกัด)"}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {p.startsAt || p.endsAt ? `${dateTime(p.startsAt)} – ${dateTime(p.endsAt)}` : "ไม่จำกัด"}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(p)}
                    aria-pressed={p.isActive}
                    className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${p.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {p.isActive ? "เปิดใช้" : "ปิดอยู่"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    aria-label={`แก้ไข ${p.code}`}
                    onClick={() => {
                      setError(null)
                      setEditing(p)
                    }}
                    className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-muted"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">ยังไม่มีโค้ดส่วนลด</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
