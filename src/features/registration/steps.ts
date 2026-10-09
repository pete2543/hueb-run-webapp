/** ขั้นตอนสมัคร 4 ขั้น ตามดีไซน์ (Distances → Runners → Summary → Payment) */
export const registrationSteps = [
  { step: 1, label: "เลือกระยะ" },
  { step: 2, label: "ข้อมูลนักวิ่ง" },
  { step: 3, label: "สรุปรายการ" },
  { step: 4, label: "ชำระเงิน" },
] as const

export type RegistrationStep = (typeof registrationSteps)[number]["step"]
