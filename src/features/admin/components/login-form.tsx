"use client"

import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react"
import { useActionState, useId, useState } from "react"
import { cn } from "@/lib/utils"
import { roleLabels, type AdminRole } from "../auth/access"
import { login, type LoginState } from "../auth/actions"

const inputClass =
  "h-12 w-full rounded-xl border bg-white pr-3.5 pl-11 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/20 aria-invalid:border-destructive aria-invalid:ring-destructive/15"

export function LoginForm({
  next,
  demoAccounts,
}: {
  next?: string
  /** แสดงเฉพาะโหมดข้อมูลจำลอง ให้กดเติมอีเมลทดสอบได้ */
  demoAccounts?: { email: string; role: AdminRole }[]
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(state.email ?? "")
  const id = useId()

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <p>
            <strong className="block">เข้าสู่ระบบไม่สำเร็จ</strong>
            {state.error}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className="text-sm font-medium">
          อีเมล
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            aria-describedby={state.fieldErrors?.email ? `${id}-email-error` : undefined}
            className={inputClass}
            autoFocus
          />
        </div>
        {state.fieldErrors?.email ? (
          <p id={`${id}-email-error`} className="text-sm text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-password`} className="text-sm font-medium">
          รหัสผ่าน
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={state.fieldErrors?.password ? true : undefined}
            aria-describedby={state.fieldErrors?.password ? `${id}-password-error` : undefined}
            className={cn(inputClass, "pr-12")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden />
            ) : (
              <Eye className="size-5" aria-hidden />
            )}
          </button>
        </div>
        {state.fieldErrors?.password ? (
          <p id={`${id}-password-error`} className="text-sm text-destructive">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        ลืมรหัสผ่านหรือยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบของงาน
      </p>

      {demoAccounts?.length ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-muted/50 p-4">
          <p className="text-sm font-semibold">บัญชีทดสอบ (โหมดข้อมูลจำลอง)</p>
          <p className="mb-3 text-xs text-muted-foreground">
            แตะเพื่อเติมอีเมล · รหัสผ่านดูที่ ADMIN_DEMO_PASSWORD ใน .env.example
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => setEmail(account.email)}
                  className={cn(
                    "flex min-h-11 w-full flex-col items-start justify-center rounded-xl border bg-white px-3 py-1.5 text-left text-xs transition hover:border-primary/50",
                    email === account.email && "border-primary ring-1 ring-primary",
                  )}
                >
                  <span className="font-semibold text-foreground">{roleLabels[account.role]}</span>
                  <span className="max-w-full truncate text-muted-foreground">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  )
}
