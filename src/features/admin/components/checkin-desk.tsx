"use client"

import { CheckCircle2, ScanLine, Undo2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { confirmCheckIn, scanTicket, undoCheckIn } from "../api/actions"
import type { CheckInRunner } from "../api/types"
import { dateTime } from "../format"

const btn = "inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"

/** ปุ่มเช็กอิน/ยกเลิกของนักวิ่ง 1 คน (ยกเลิกเฉพาะผู้จัดงาน/ผู้ดูแลระบบ ต้องมีเหตุผล) */
export function RunnerActions({
  runner,
  canUndo,
  onChange,
}: {
  runner: CheckInRunner
  canUndo: boolean
  onChange?: (r: CheckInRunner, already?: boolean) => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function confirm() {
    setError(null)
    start(async () => {
      const res = await confirmCheckIn(runner.registrationId)
      if (!res.ok) return setError(res.error)
      onChange?.(res.data.runner, res.data.alreadyCheckedIn)
      router.refresh()
    })
  }

  function undo() {
    const note = prompt("เหตุผลที่ยกเลิกเช็กอิน (บังคับ)")?.trim()
    if (!note) return
    setError(null)
    start(async () => {
      const res = await undoCheckIn(runner.registrationId, note)
      if (!res.ok) return setError(res.error)
      onChange?.(res.data)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {runner.checkedInAt ? (
        canUndo ? (
          <button type="button" onClick={undo} disabled={pending} className={`${btn} text-destructive hover:bg-destructive/5`}>
            <Undo2 className="size-4" aria-hidden /> ยกเลิก
          </button>
        ) : null
      ) : (
        <button
          type="button"
          onClick={confirm}
          disabled={pending || !runner.eligible}
          className={`${btn} border-transparent bg-primary text-primary-foreground`}
        >
          <CheckCircle2 className="size-4" aria-hidden /> เช็กอิน
        </button>
      )}
      {error ? <span role="alert" className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}

/** ช่องสแกน: เครื่องสแกน QR/บาร์โค้ดพิมพ์ค่าลงช่องนี้แล้วกด Enter ได้เลย */
export function ScanBox({ canUndo }: { canUndo: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [runner, setRunner] = useState<CheckInRunner | null>(null)
  const [note, setNote] = useState<string | null>(null)

  function scan(form: HTMLFormElement) {
    const token = String(new FormData(form).get("token") ?? "").trim()
    if (!token) return
    setError(null)
    setNote(null)
    start(async () => {
      const res = await scanTicket(token)
      form.reset()
      input.current?.focus()
      if (!res.ok) {
        setRunner(null)
        return setError(res.error)
      }
      setRunner(res.data)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          scan(e.currentTarget)
        }}
        className="flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <ScanLine className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            ref={input}
            name="token"
            autoFocus
            autoComplete="off"
            placeholder="สแกน QR บนตั๋ว หรือวางรหัสตั๋ว"
            className="h-12 w-full rounded-xl border bg-white pr-3 pl-12 text-base outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>
        <button disabled={pending} className="h-12 rounded-xl bg-primary px-6 font-medium text-primary-foreground disabled:opacity-50">
          {pending ? "…" : "ค้นหา"}
        </button>
      </form>

      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{error}</p> : null}

      {runner ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${runner.checkedInAt ? "border-caution/40 bg-caution/10" : runner.eligible ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}
        >
          <div>
            <p className="font-mono text-2xl font-bold">{runner.bibNumber ?? "ไม่มีบิบ"}</p>
            <p className="font-medium">
              {runner.firstName} {runner.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {runner.distance} · เสื้อ {runner.shirtSize} · {runner.orderNo}
              {runner.teamName ? ` · ทีม ${runner.teamName}` : ""}
            </p>
            {runner.checkedInAt ? (
              <p className="mt-1 text-sm font-medium text-caution">
                {note ?? "เช็กอินไปแล้ว"} เมื่อ {dateTime(runner.checkedInAt)}
                {runner.checkedInBy ? ` โดย ${runner.checkedInBy}` : ""}
              </p>
            ) : !runner.eligible ? (
              <p className="mt-1 text-sm font-medium text-destructive">เช็กอินไม่ได้: ยังไม่จ่ายเงิน/ถูกยกเลิก/ยังไม่มีบิบ</p>
            ) : null}
          </div>
          <RunnerActions
            runner={runner}
            canUndo={canUndo}
            onChange={(r, already) => {
              setRunner(r)
              setNote(already ? "มีโต๊ะอื่นเช็กอินให้แล้ว" : null)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
