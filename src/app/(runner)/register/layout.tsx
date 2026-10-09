import Link from "next/link"
import { Logo } from "@/components/logo"

/**
 * เลย์เอาต์ขั้นตอนสมัคร: mobile-first กว้างสุด 520px ตามดีไซน์ (390px)
 * ให้เบาที่สุด ห้ามมี 3D หรือสคริปต์หนัก
 */
export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-6 px-5 pt-5 pb-12">
      <header>
        <Link href="/" aria-label="กลับหน้าแรก">
          <Logo />
        </Link>
      </header>
      {children}
    </div>
  )
}
