"use client"

import dynamic from "next/dynamic"
import { Pause, Play } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Mascot } from "@/components/mascot"
import { cn } from "@/lib/utils"

/** โหลดฉาก 3D (three.js) แยกไฟล์ หลังหน้าแสดงผลแล้วเท่านั้น */
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false })

let webglSupport: boolean | undefined
function getWebglSupport() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas")
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    } catch {
      webglSupport = false
    }
  }
  return webglSupport
}
const noopSubscribe = () => () => {}

/**
 * ส่วนภาพของ hero: แสดงภาพนิ่งน้องฮึบก่อน (เร็ว, SEO, เครื่องที่ไม่มี WebGL)
 * แล้วค่อยเฟดเป็นฉาก 3D เมื่อโหลดเสร็จ
 * หยุดแอนิเมชันเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว เมื่อกดปุ่มหยุด หรือเลื่อนพ้นจอ
 */
export function HeroVisual({ className }: { className?: string }) {
  const hasWebgl = useSyncExternalStore(noopSubscribe, getWebglSupport, () => false)
  const reducedMotion = useReducedMotion()
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [inView, setInView] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const paused = userPaused ?? Boolean(reducedMotion)
  const handleReady = useCallback(() => setSceneReady(true), [])

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-linear-to-b from-[#dceaff] via-[#eef5ff] to-white",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-end justify-center transition-opacity duration-700",
          sceneReady && "opacity-0",
        )}
      >
        <div className="absolute bottom-[8%] h-[28%] w-[80%] rounded-[50%] bg-primary/85" />
        <Mascot
          pose="running"
          highPriority
          sizes="(min-width: 1024px) 320px, 220px"
          className="relative h-[88%] w-auto"
        />
      </div>

      {hasWebgl ? (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            sceneReady ? "opacity-100" : "opacity-0",
          )}
        >
          <HeroScene paused={paused || !inView} onReady={handleReady} />
        </div>
      ) : null}

      {hasWebgl ? (
        <button
          type="button"
          onClick={() => setUserPaused(!paused)}
          aria-label={paused ? "เล่นแอนิเมชัน" : "หยุดแอนิเมชัน"}
          aria-pressed={paused}
          className="absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur hover:bg-white"
        >
          {paused ? (
            <Play className="size-4" aria-hidden />
          ) : (
            <Pause className="size-4" aria-hidden />
          )}
        </button>
      ) : null}
    </div>
  )
}
