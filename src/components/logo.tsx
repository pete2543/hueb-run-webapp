import { cn } from "@/lib/utils"

/** โลโก้ตัวอักษร HUEB RUN บนพื้นขาว (บนพื้น Royal Blue ให้ใช้ RUN สี gold แทน) */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading text-lg font-bold tracking-wide italic", className)}>
      HUEB <span className="text-primary">RUN</span>
    </span>
  )
}
