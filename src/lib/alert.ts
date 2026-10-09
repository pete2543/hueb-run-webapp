import Swal from "sweetalert2"

/**
 * SweetAlert2 ที่ตั้งสีตามธีมของงานไว้แล้ว เรียกใช้ได้เฉพาะใน client component
 *   await alert.fire({ icon: "success", title: "ส่งสลิปแล้ว" })
 *   const { isConfirmed } = await alert.fire({ title: "ยืนยัน?", showCancelButton: true })
 */
export const alert = Swal.mixin({
  background: "#141d31",
  color: "#f3f6fb",
  confirmButtonColor: "#c6f432",
  cancelButtonColor: "#2a3857",
  confirmButtonText: "ตกลง",
  cancelButtonText: "ยกเลิก",
  customClass: {
    confirmButton: "!text-[#0b1220] !font-semibold !min-h-11 !rounded-full !px-6",
    cancelButton: "!min-h-11 !rounded-full !px-6",
    popup: "!rounded-2xl !border !border-[#2a3857]",
  },
})

/** แจ้งเตือนเล็ก ๆ มุมบน หายเองใน 3 วินาที */
export const toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#1b2740",
  color: "#f3f6fb",
})
