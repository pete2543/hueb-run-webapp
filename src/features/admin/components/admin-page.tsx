import { Mascot } from "@/components/mascot"
import { cn } from "@/lib/utils"
import { findNavItem } from "../nav"

/** หัวหน้าของทุกหน้าหลังบ้าน: ไอคอน ชื่อ คำอธิบาย และปุ่มด้านขวา */
export function AdminPageHeader({
  href,
  title,
  description,
  actions,
}: {
  /** ดึงชื่อ/คำอธิบาย/ไอคอนจากเมนู */
  href: string
  title?: string
  description?: string
  actions?: React.ReactNode
}) {
  const item = findNavItem(href)
  const Icon = item?.icon
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {Icon ? (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-border">
            <Icon className="size-6" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-bold sm:text-3xl">{title ?? item?.label}</h1>
          <p className="text-muted-foreground">{description ?? item?.description}</p>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

/** การ์ดพื้นฐานของหลังบ้าน */
export function AdminCard({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-2xl border bg-white p-5 shadow-sm shadow-primary/5 sm:p-6", className)}
      {...props}
    />
  )
}

/** หน้าที่ยังไม่ได้ทำ: บอกว่าจะทำตามดีไซน์ไหน */
export function ComingSoon({ design, items }: { design: string; items?: string[] }) {
  return (
    <AdminCard className="flex flex-col items-center gap-4 py-12 text-center">
      <Mascot pose="thinking" sizes="140px" className="h-auto w-28" />
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">หน้านี้กำลังสร้าง</h2>
        <p className="text-sm text-muted-foreground">
          ทำตามดีไซน์ <code className="rounded bg-muted px-1.5 py-0.5">docs/design/{design}</code>
        </p>
      </div>
      {items?.length ? (
        <ul className="flex max-w-lg flex-wrap justify-center gap-2">
          {items.map((item) => (
            <li key={item} className="rounded-full border bg-muted/50 px-3 py-1 text-sm">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </AdminCard>
  )
}
