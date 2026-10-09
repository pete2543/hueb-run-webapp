import Image from "next/image"
import pointing from "@/assets/brand/mascot-pointing.webp"
import running from "@/assets/brand/mascot-running.webp"
import thinking from "@/assets/brand/mascot-thinking.webp"
import thumbsUp from "@/assets/brand/mascot-thumbs-up.webp"
import wai from "@/assets/brand/mascot-wai.webp"
import waving from "@/assets/brand/mascot-waving.webp"

/**
 * น้องมาสคอตกระต่าย HUEB RUN (ภาพพื้นโปร่งใส)
 * - running: หน้าแรก, ชวนสมัคร
 * - waving: ทักทาย, หน้าไม่พบ, ส่วนท้ายเว็บ
 * - thumbs-up: สมัครสำเร็จ, ทำรายการเสร็จ
 * - thinking: คำถามที่พบบ่อย, รอตรวจสลิป, สถานะว่าง
 * - pointing: ชี้ไปที่ปุ่ม/ขั้นตอนถัดไป, แนะนำ
 * - wai: ขอบคุณ, ขออภัย (เช่น โควตาเต็ม ปิดรับสมัคร)
 */
const poses = {
  running: { src: running, alt: "น้องกระต่าย HUEB RUN กำลังวิ่ง" },
  waving: { src: waving, alt: "น้องกระต่าย HUEB RUN โบกมือทักทาย" },
  "thumbs-up": { src: thumbsUp, alt: "น้องกระต่าย HUEB RUN ชูนิ้วโป้ง" },
  thinking: { src: thinking, alt: "น้องกระต่าย HUEB RUN นั่งเท้าคางครุ่นคิด" },
  pointing: { src: pointing, alt: "น้องกระต่าย HUEB RUN ชี้นิ้ว" },
  wai: { src: wai, alt: "น้องกระต่าย HUEB RUN ไหว้ขอบคุณ" },
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
