const tz = "Asia/Bangkok"

export function baht(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: tz,
  }).format(new Date(iso))
}
