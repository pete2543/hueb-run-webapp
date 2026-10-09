"use client"

import { useSyncExternalStore } from "react"

/**
 * ข้อมูลใบสมัครที่กรอกค้างไว้ระหว่างขั้นตอน 1–3 (ยังไม่ส่งเข้า API)
 * เก็บใน sessionStorage: รีเฟรชแล้วไม่หาย แต่ปิดแท็บแล้วล้างทิ้ง
 * เพราะมีข้อมูลส่วนบุคคล/สุขภาพ จึงไม่เก็บถาวรใน localStorage
 */

export type RunnerDraft = {
  distanceId: number
}

export type RegistrationDraft = {
  runners: RunnerDraft[]
}

const storageKey = "hueb-run:registration-draft"
const emptyDraft: RegistrationDraft = { runners: [] }

let draft: RegistrationDraft = emptyDraft
let loaded = false
const listeners = new Set<() => void>()

function getDraft() {
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

function setDraft(next: RegistrationDraft) {
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

/** ขั้นตอนที่ 1 เลือกระยะให้นักวิ่งคนแรก (คนถัดไปเลือกในหน้าข้อมูลนักวิ่ง) */
export function setFirstRunnerDistance(distanceId: number) {
  const [first, ...rest] = getDraft().runners
  setDraft({ runners: [{ ...first, distanceId }, ...rest] })
}
