const baht = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** 1050 → "฿1,050", 1000.37 → "฿1,000.37" */
export function formatBaht(amount: number) {
  return baht.format(amount)
}

const thaiDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeZone: "Asia/Bangkok",
})

/** "2027-01-17T00:00:00Z" → "17 มกราคม 2570" (เวลาไทย) */
export function formatThaiDate(iso: string) {
  return thaiDate.format(new Date(iso))
}
