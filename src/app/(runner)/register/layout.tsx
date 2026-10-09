import Link from "next/link"
import { Logo } from "@/components/logo"

/**
 * เลย์เอาต์ขั้นตอนสมัคร: มือถือคอลัมน์เดียว เดสก์ท็อปกว้างสุด 6xl (หน้าไหนจะมีแถบสรุปด้านขวาก็จัดเอง)
 * ให้เบาที่สุด ห้ามมี 3D หรือสคริปต์หนัก
 */
export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-[#f4f8ff] to-white">
      <header className="border-b border-border/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 lg:h-18">
          <Link href="/" aria-label="กลับหน้าแรก">
            <Logo className="h-8 lg:h-9" />
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-5 pb-12 lg:pt-8">
        {children}
      </div>
    </div>
  )
}
