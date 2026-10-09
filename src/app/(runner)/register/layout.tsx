import Link from "next/link"

/** หัวหน้าขั้นตอนสมัคร (หน้า 2–6) ให้เบาที่สุด ห้ามมี 3D หรือสคริปต์หนัก */
export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/" className="font-heading text-lg font-bold tracking-widest">
          FUN<span className="text-primary">RUN</span>
        </Link>
      </header>
      {children}
    </div>
  )
}
