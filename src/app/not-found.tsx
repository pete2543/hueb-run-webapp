import Link from "next/link"
import { Mascot } from "@/components/mascot"

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <Mascot pose="waving" sizes="160px" className="h-auto w-40" />
      <h1 className="text-3xl font-bold">ไม่พบหน้านี้</h1>
      <p className="text-muted-foreground">ลิงก์อาจผิดหรือหน้านี้ถูกย้ายไปแล้ว</p>
      <Link
        href="/"
        className="flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
      >
        กลับหน้าแรก
      </Link>
    </main>
  )
}
