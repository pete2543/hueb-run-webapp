/**
 * หน้าว่างชั่วคราวระหว่างตั้งโครง แสดงว่าหน้านี้ต้องทำตามไฟล์ดีไซน์ไหน
 * ลบทิ้งเมื่อทำหน้าจริงครบแล้ว
 */
export function PagePlaceholder({
  title,
  design,
  notes,
}: {
  title: string
  /** ชื่อไฟล์ใน docs/design เช่น "Distances.dc.html" */
  design: string
  notes?: string
}) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border bg-card p-5">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">
        ยังไม่ได้ทำ · ดีไซน์: <code>docs/design/{design}</code>
      </p>
      {notes ? <p className="text-sm text-muted-foreground">{notes}</p> : null}
    </section>
  )
}
