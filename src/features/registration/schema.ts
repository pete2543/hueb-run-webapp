import { z } from "zod"

/** นักวิ่งต่อใบสมัครสูงสุด (กันกรอกยาวเกิน และกันจองโควตาทีละมาก ๆ) */
export const maxRunnersPerOrder = 10

const required = (message: string) => ({ error: message })

/** รับ 08x-xxx-xxxx, 08xxxxxxxx, 02 xxx xxxx (9–10 หลักขึ้นต้น 0) */
const phone = z
  .string(required("กรุณากรอกเบอร์โทร"))
  .trim()
  .min(1, "กรุณากรอกเบอร์โทร")
  .refine((v) => /^0\d{8,9}$/.test(v.replace(/[\s-]/g, "")), "เบอร์โทรไม่ถูกต้อง")

/** ตัดขีด/ช่องว่างออกก่อนส่ง API */
export function normalizePhone(value: string) {
  return value.replace(/[\s-]/g, "")
}

const birthDate = z
  .string(required("กรุณาระบุวันเกิด"))
  .min(1, "กรุณาระบุวันเกิด")
  .refine((v) => {
    const date = new Date(`${v}T00:00:00`)
    if (Number.isNaN(date.getTime())) return false
    const now = new Date()
    const oldest = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate())
    return date < now && date > oldest
  }, "วันเกิดไม่ถูกต้อง")

export const genders = [
  { value: "Male", label: "ชาย" },
  { value: "Female", label: "หญิง" },
  { value: "Other", label: "อื่น ๆ" },
] as const

/** ฟิลด์ของนักวิ่ง 1 คน ตรงกับ runners[] ใน POST /events/{slug}/orders */
export const runnerSchema = z
  .object({
    distanceId: z.number(required("กรุณาเลือกระยะ")),
    shirtSizeId: z.number(required("กรุณาเลือกไซซ์เสื้อ")),
    titleId: z.number(required("กรุณาเลือกคำนำหน้า")),
    firstName: z.string(required("กรุณากรอกชื่อ")).trim().min(1, "กรุณากรอกชื่อ").max(100),
    lastName: z.string(required("กรุณากรอกนามสกุล")).trim().min(1, "กรุณากรอกนามสกุล").max(100),
    gender: z.enum(["Male", "Female", "Other"], required("กรุณาเลือกเพศ")),
    birthDate,
    nationalityId: z.number(required("กรุณาเลือกสัญชาติ")),
    phone,
    emergencyContact: z.object({
      name: z
        .string(required("กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน"))
        .trim()
        .min(1, "กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน")
        .max(150),
      relationId: z.number(required("กรุณาเลือกความสัมพันธ์")),
      phone,
    }),
    bloodTypeId: z.number(required("กรุณาเลือกกรุ๊ปเลือด (เลือก “ไม่ทราบ” ได้)")),
    medicalNote: z.string().trim().max(500, "ยาวเกิน 500 ตัวอักษร"),
  })
  .refine((r) => normalizePhone(r.emergencyContact.phone) !== normalizePhone(r.phone), {
    message: "ใช้เบอร์ของคนอื่นที่ติดต่อได้ ไม่ใช่เบอร์ของนักวิ่งเอง",
    path: ["emergencyContact", "phone"],
  })

export const runnersStepSchema = z.object({
  runners: z.array(runnerSchema).min(1).max(maxRunnersPerOrder),
  acceptedPdpa: z.literal(true, required("กรุณายอมรับเงื่อนไขก่อนไปต่อ")),
})

export type RunnerValues = z.infer<typeof runnerSchema>
export type RunnersStepValues = z.infer<typeof runnersStepSchema>

/** ค่าเริ่มต้นของนักวิ่งคนใหม่ (ฟิลด์ตัวเลขเว้นว่างไว้ให้เลือกเอง) */
export function emptyRunner(distanceId?: number): Partial<RunnerValues> {
  return {
    distanceId,
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
    emergencyContact: { name: "", phone: "" } as RunnerValues["emergencyContact"],
    medicalNote: "",
  }
}

/** ที่อยู่จัดส่ง (ใช้เมื่อเลือกส่งไปรษณีย์) */
export const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อผู้รับ").max(150),
  phone,
  line1: z.string().trim().min(5, "กรุณากรอกบ้านเลขที่ ซอย ถนน").max(300),
  postalCode: z.string().regex(/^\d{5}$/, "รหัสไปรษณีย์ 5 หลัก"),
  subdistrictId: z.number(required("กรุณาเลือกตำบล/แขวง")),
})

/** ขั้นตอนที่ 3: ผู้ติดต่อ วิธีรับของ ที่อยู่ โค้ดส่วนลด */
export const summaryStepSchema = z
  .object({
    contact: z.object({
      name: z.string().trim().min(1, "กรุณากรอกชื่อผู้ติดต่อ").max(150),
      phone,
      email: z.union([z.literal(""), z.email("อีเมลไม่ถูกต้อง")]),
    }),
    shippingOptionId: z.number(required("กรุณาเลือกวิธีรับของ")),
    /** true เมื่อตัวเลือกที่เลือกเป็นแบบส่งไปรษณีย์ (หน้าเว็บตั้งให้) */
    needsAddress: z.boolean(),
    shippingAddress: z.unknown(),
    promoCode: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.needsAddress) return
    const result = shippingAddressSchema.safeParse(values.shippingAddress)
    if (result.success) return
    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: "custom",
        message: issue.message,
        path: ["shippingAddress", ...issue.path],
      })
    }
  })

export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>
export type SummaryStepValues = Omit<z.infer<typeof summaryStepSchema>, "shippingAddress"> & {
  shippingAddress?: Partial<ShippingAddressValues>
}

/** รูปคำขอของ POST /events/{slug}/orders (docs/api-contract.md) */
export const createOrderSchema = z.object({
  contact: z.object({ name: z.string(), phone: z.string(), email: z.string() }),
  runners: z.array(runnerSchema).min(1).max(maxRunnersPerOrder),
  shippingOptionId: z.number(),
  shippingAddress: shippingAddressSchema.nullable(),
  promoCode: z.string(),
  acceptedPdpa: z.literal(true),
})

export type CreateOrderPayload = z.infer<typeof createOrderSchema>
