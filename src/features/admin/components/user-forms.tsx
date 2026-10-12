"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createUser, updateUser } from "../api/actions"
import { roleLabels, roles } from "../auth/access"

const field = "h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"

export function CreateUserForm({ eventId }: { eventId: number }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(form: HTMLFormElement) {
    const data = new FormData(form)
    const role = String(data.get("role"))
    setError(null)
    start(async () => {
      const res = await createUser({
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim(),
        password: String(data.get("password")),
        role,
        eventIds: role === "SuperAdmin" ? [] : [eventId],
      })
      if (!res.ok) return setError(res.error)
      form.reset()
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(e.currentTarget)
      }}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <input name="name" required placeholder="ชื่อ" aria-label="ชื่อ" className={field} />
      <input name="email" type="email" required placeholder="อีเมล" aria-label="อีเมล" autoComplete="off" className={field} />
      <input name="password" type="password" required minLength={10} placeholder="รหัสผ่าน (≥10 ตัว)" aria-label="รหัสผ่าน" autoComplete="new-password" className={field} />
      <select name="role" defaultValue="Staff" aria-label="บทบาท" className={field}>
        {roles.map((r) => (
          <option key={r} value={r}>
            {roleLabels[r]}
          </option>
        ))}
      </select>
      <button disabled={pending} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
        เพิ่มผู้ใช้
      </button>
      {error ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-5">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export function ToggleActive({ id, isActive, disabled }: { id: string; isActive: boolean; disabled?: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending || disabled}
        onClick={() =>
          start(async () => {
            setError(null)
            const res = await updateUser(id, { isActive: !isActive })
            if (!res.ok) setError(res.error)
            router.refresh()
          })
        }
        className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {isActive ? "ปิดบัญชี" : "เปิดบัญชี"}
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </span>
  )
}
