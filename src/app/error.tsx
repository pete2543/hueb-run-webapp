"use client"

import Link from "next/link"
import { Mascot } from "@/components/mascot"

/** หน้าแสดงเมื่อเกิดข้อผิดพลาดที่ไม่คาดคิด (error boundary ของทั้งแอป) */
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
      <Mascot pose="wai" sizes="160px" className="h-auto w-36" />
      <h1 className="text-3xl font-bold">ขออภัย เกิดข้อผิดพลาด</h1>
      <p className="text-muted-foreground">
        ระบบขัดข้องชั่วคราว ข้อมูลที่กรอกไว้ยังอยู่ ลองใหม่อีกครั้งได้เลย
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground"
        >
          ลองใหม่
        </button>
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-full border-2 border-primary/30 px-6 font-semibold text-primary"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </main>
  )
}
