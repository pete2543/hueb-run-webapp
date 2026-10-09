import QRCode from "qrcode"

/** สร้าง QR ฝั่งเซิร์ฟเวอร์ ไม่ต้องส่งไลบรารี QR ไปที่มือถือ */
const options = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  color: { dark: "#102a56", light: "#ffffff" },
}

export async function qrSvg(text: string) {
  return QRCode.toString(text, { ...options, type: "svg" })
}

/** PNG สำหรับปุ่ม "บันทึกรูป QR" (เอาไปเปิดในแอปธนาคารได้) */
export async function qrPngDataUrl(text: string) {
  return QRCode.toDataURL(text, { ...options, width: 720 })
}
