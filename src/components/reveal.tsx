"use client"

import { LazyMotion, MotionConfig, domAnimation, m } from "motion/react"

/**
 * เฟดขึ้นเมื่อเลื่อนมาเห็น (ครั้งเดียว) ใช้กับส่วนที่อยู่ใต้ hero เท่านั้น
 * ถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว จะแสดงทันทีโดยไม่ขยับ
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          className={className}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay }}
        >
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  )
}
