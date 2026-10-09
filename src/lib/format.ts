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
