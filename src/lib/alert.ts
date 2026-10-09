import Swal from "sweetalert2"

/**
 * SweetAlert2 ที่ตั้งสีตามธีมของงานไว้แล้ว เรียกใช้ได้เฉพาะใน client component
 *   await alert.fire({ icon: "success", title: "ส่งสลิปแล้ว" })
 *   const { isConfirmed } = await alert.fire({ title: "ยืนยัน?", showCancelButton: true })
 *
 * สีอ้างอิง CSS variable ใน globals.css เปลี่ยนธีมที่นั่นที่เดียว
 */
export const alert = Swal.mixin({
  background: "var(--card)",
  color: "var(--foreground)",
  confirmButtonColor: "var(--primary)",
  cancelButtonColor: "var(--muted)",
  confirmButtonText: "ตกลง",
  cancelButtonText: "ยกเลิก",
  customClass: {
    confirmButton: "!min-h-11 !rounded-full !px-6 !font-semibold !text-primary-foreground",
    cancelButton: "!min-h-11 !rounded-full !px-6 !text-foreground",
    popup: "!rounded-2xl !border !border-border",
  },
})

/** แจ้งเตือนเล็ก ๆ มุมบน หายเองใน 3 วินาที */
export const toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "var(--card)",
  color: "var(--foreground)",
  customClass: { popup: "!border !border-border" },
})
