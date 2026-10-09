"use client"

import { useSyncExternalStore } from "react"

/** true เมื่อหน้าจอตรงเงื่อนไข เช่น useMediaQuery("(min-width: 640px)") ฝั่ง server ถือว่า false */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
