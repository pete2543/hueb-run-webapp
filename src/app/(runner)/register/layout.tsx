import Link from "next/link"
import { Logo } from "@/components/logo"

/** หัวหน้าขั้นตอนสมัคร (หน้า 2–6) ให้เบาที่สุด ห้ามมี 3D หรือสคริปต์หนัก */
export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/" aria-label="กลับหน้าแรก">
          <Logo />
        </Link>
      </header>
      {children}
    </div>
  )
}
