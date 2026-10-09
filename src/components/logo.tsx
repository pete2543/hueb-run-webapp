import Image from "next/image"
import { cn } from "@/lib/utils"
import logo from "@/assets/brand/logo.webp"

/** โลโก้ HUEB RUN (พื้นโปร่งใส ใช้บนพื้นขาว/Ice Blue) กำหนดความสูงด้วย className เช่น h-8 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="HUEB RUN"
      loading="eager"
      sizes="200px"
      className={cn("h-8 w-auto", className)}
    />
  )
}
