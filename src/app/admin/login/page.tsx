import { CheckCircle2 } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Logo } from "@/components/logo"
import { Mascot } from "@/components/mascot"
import { mockAdmins } from "@/features/admin/auth/mock-users"
import { LoginForm } from "@/features/admin/components/login-form"

export const metadata: Metadata = { title: "เข้าสู่ระบบ" }

const highlights = [
  "ตรวจสลิปและอนุมัติใบสมัคร",
  "เช็กอินรับบิบด้วย QR ในวันงาน",
  "ประกาศถึงนักวิ่งผ่าน LINE OA",
]

const useMock = process.env.API_MOCK !== "false"

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="grid min-h-dvh flex-1 bg-[#f4f7fd] lg:grid-cols-[1.05fr_1fr]">
      {/* แผงแบรนด์ (คอม) */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-primary via-[#1b55d4] to-[#0f3a9e] p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
        <TrackPattern />
        <div className="relative flex items-center gap-3">
          <span className="rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-black/10">
            <Logo className="h-8" />
          </span>
          <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-bold tracking-wider">
            ADMIN
          </span>
        </div>

        <div className="relative flex max-w-[62%] flex-col gap-6 xl:max-w-[58%]">
          <h1 className="text-4xl leading-tight font-bold xl:text-5xl">
            หลังบ้าน
            <span className="block text-gold">HUEB RUN</span>
          </h1>
          <p className="text-lg text-white/80">
            จัดการใบสมัคร ตรวจสลิป และดูแลนักวิ่งทุกคนให้ถึงเส้นชัย
          </p>
          <ul className="flex flex-col gap-3">
            {highlights.map((text) => (
              <li key={text} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 shrink-0 text-gold" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">สำหรับผู้จัดงาน การเงิน และสตาฟเท่านั้น</p>

        <Mascot
          pose="waving"
          highPriority
          sizes="320px"
          className="pointer-events-none absolute -right-6 bottom-0 h-auto w-64 drop-shadow-2xl xl:w-80"
        />
      </aside>

      {/* ฟอร์ม */}
      <main className="flex flex-col">
        {/* หัวแบรนด์ (มือถือ) */}
        <div className="relative overflow-hidden bg-linear-to-br from-primary to-[#1b55d4] px-6 pt-6 pb-16 text-primary-foreground lg:hidden">
          <TrackPattern />
          <span className="relative inline-block rounded-xl bg-white px-3 py-2">
            <Logo className="h-6" />
          </span>
          <p className="relative mt-4 font-heading text-2xl font-bold">
            หลังบ้าน <span className="text-gold">HUEB RUN</span>
          </p>
          <Mascot
            pose="waving"
            sizes="140px"
            className="pointer-events-none absolute right-3 -bottom-2 h-auto w-28"
          />
        </div>

        <div className="relative z-10 -mt-10 flex flex-1 items-start justify-center px-4 pb-10 lg:mt-0 lg:items-center lg:px-10">
          <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-xl shadow-primary/10 sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-2xl font-bold sm:text-3xl">เข้าสู่ระบบ</h2>
              <p className="text-muted-foreground">ใช้อีเมลและรหัสผ่านที่ผู้ดูแลระบบให้ไว้</p>
            </div>
            <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-muted" />}>
              <LoginFormWithNext searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

async function LoginFormWithNext({
  searchParams,
}: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { next } = await searchParams
  return (
    <LoginForm
      next={typeof next === "string" ? next : undefined}
      demoAccounts={useMock ? mockAdmins.map(({ email, role }) => ({ email, role })) : undefined}
    />
  )
}

/** ลายเส้นลู่วิ่งจาง ๆ เป็นพื้นหลังแผงแบรนด์ */
function TrackPattern() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -top-24 -left-24 size-[46rem] text-white/[0.07]"
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
    >
      {[60, 95, 130, 165].map((r) => (
        <ellipse key={r} cx="200" cy="200" rx={r * 1.15} ry={r} />
      ))}
    </svg>
  )
}
