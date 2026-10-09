import Image from "next/image"
import running from "@/assets/brand/mascot-running.webp"
import thumbsUp from "@/assets/brand/mascot-thumbs-up.webp"
import waving from "@/assets/brand/mascot-waving.webp"

/**
 * น้องมาสคอตกระต่าย HUEB RUN
 * - running: หน้าแรก / ชวนสมัคร
 * - waving: ทักทาย, หน้าไม่พบ, สถานะว่าง
 * - thumbs-up: สมัครสำเร็จ, ทำรายการเสร็จ
 */
const poses = {
  running: { src: running, alt: "น้องกระต่าย HUEB RUN กำลังวิ่ง" },
  waving: { src: waving, alt: "น้องกระต่าย HUEB RUN โบกมือทักทาย" },
  "thumbs-up": { src: thumbsUp, alt: "น้องกระต่าย HUEB RUN ชูนิ้วโป้ง" },
} as const

export type MascotPose = keyof typeof poses

export function Mascot({
  pose,
  className,
  sizes = "240px",
  highPriority = false,
}: {
  pose: MascotPose
  /** กำหนดขนาดด้วย className เช่น w-48 h-auto */
  className?: string
  sizes?: string
  /** ใส่เมื่อเป็นภาพใหญ่ด้านบนของหน้า (LCP) */
  highPriority?: boolean
}) {
  const { src, alt } = poses[pose]
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      loading={highPriority ? "eager" : undefined}
      fetchPriority={highPriority ? "high" : undefined}
      className={className}
    />
  )
}
