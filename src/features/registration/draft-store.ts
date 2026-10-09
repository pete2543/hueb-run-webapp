"use client"

import { useSyncExternalStore } from "react"
import type { RunnerValues } from "./schema"

/**
 * ข้อมูลใบสมัครที่กรอกค้างไว้ระหว่างขั้นตอน 1–3 (ยังไม่ส่งเข้า API)
 * เก็บใน sessionStorage: รีเฟรชแล้วไม่หาย แต่ปิดแท็บแล้วล้างทิ้ง
 * เพราะมีข้อมูลส่วนบุคคล/สุขภาพ จึงไม่เก็บถาวรใน localStorage
 */

/** ระหว่างกรอกยังไม่ครบ ทุกฟิลด์จึงอาจว่าง */
export type RunnerDraft = Partial<RunnerValues>

export type RegistrationDraft = {
  runners: RunnerDraft[]
  acceptedPdpa?: boolean
}

const storageKey = "hueb-run:registration-draft"
const emptyDraft: RegistrationDraft = { runners: [] }

let draft: RegistrationDraft = emptyDraft
let loaded = false
const listeners = new Set<() => void>()

export function getDraft() {
  if (!loaded) {
    loaded = true
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) draft = JSON.parse(raw) as RegistrationDraft
    } catch {
      // sessionStorage ใช้ไม่ได้ (โหมดส่วนตัวบางเบราว์เซอร์) ใช้ค่าในหน่วยความจำต่อ
    }
  }
  return draft
}

export function setDraft(next: RegistrationDraft) {
  draft = next
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // เหมือนด้านบน
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRegistrationDraft() {
  return useSyncExternalStore(subscribe, getDraft, () => emptyDraft)
}

/** true หลัง hydrate แล้ว (อ่าน sessionStorage ได้) ใช้รอก่อนสร้างฟอร์มจาก draft */
export function useDraftReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

/** ขั้นตอนที่ 1 เลือกระยะให้นักวิ่งคนแรก (คนถัดไปเลือกในหน้าข้อมูลนักวิ่ง) */
export function setFirstRunnerDistance(distanceId: number) {
  const current = getDraft()
  const [first, ...rest] = current.runners
  setDraft({ ...current, runners: [{ ...first, distanceId }, ...rest] })
}
