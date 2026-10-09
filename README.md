# HuebRun (ชื่อชั่วคราว)

ระบบรับสมัครงานเดิน-วิ่ง: หน้าลงทะเบียนสำหรับนักวิ่ง, หลังบ้านสำหรับผู้จัด, แจ้งเตือนผ่าน LINE OA
เริ่มจากงานเดียว (~1,000 คน, ระยะ 3 / 5 / 10 กม.) ออกแบบให้ใช้ซ้ำข้ามปีได้ และขยายเป็นผลิตภัณฑ์ขายผู้จัดอื่นได้ในอนาคต

> สถานะ: **ช่วงออกแบบ** มี DB schema (ยังไม่ได้ compile/migrate) และเดโม UI แบบคลิกดู flow
> ข้อมูลทุกอย่างในเดโมเป็นตัวอย่าง ราคา/ต้นทุนในเอกสารเป็นการประมาณ ยังไม่ได้ตรวจกับแหล่งจริง

## สแตกที่ตัดสินใจแล้ว

| ส่วน | เทคโนโลยี |
|---|---|
| หน้าบ้าน + หลังบ้านแอดมิน | Next.js (TypeScript), Tailwind CSS, shadcn/ui |
| ฟอร์ม | React Hook Form + Zod |
| 3D (เฉพาะหน้าแลนดิ้ง) | React Three Fiber + Drei (lazy load, มี fallback) |
| API | C# ASP.NET Core Web API, EF Core |
| ฐานข้อมูล | PostgreSQL |
| งานเบื้องหลัง | Hangfire (ใช้ DB เดิม ไม่ใช้ Redis/RabbitMQ) |
| ชำระเงิน | PromptPay QR + ตรวจสลิปอัตโนมัติ (เฟส 1), payment gateway (เฟสถัดไป) |
| แจ้งเตือน | LINE Messaging API + LINE Login/LIFF |
| CDN / กันโหลด | Cloudflare |

## เอกสาร

| ไฟล์ | เนื้อหา |
|---|---|
| [docs/plan.md](docs/plan.md) | การตัดสินใจทั้งหมด, สถาปัตยกรรม, flow, roadmap, ความเสี่ยง, เรื่องที่ยังไม่ตัดสินใจ |
| [docs/design/](docs/design/) | ไฟล์ดีไซน์ 18 หน้าจอ ดึงมาจาก Design canvas |
| [docs/ui-flow.md](docs/ui-flow.md) | รายการหน้าจอ 18 หน้า, เส้นทาง URL ที่เสนอ, design tokens |
| [docs/api-contract.md](docs/api-contract.md) | ร่าง endpoint ที่หน้าเว็บต้องใช้ (ใช้ทำ mock ระหว่างทำหน้าบ้านก่อน) |
| [docs/db-schema/](docs/db-schema/) | EF Core entities + DbContext + seed (ใช้อ้างอิง ไม่ใช่โค้ดที่ build ใน repo นี้) |
| [docs/costs-and-pricing.md](docs/costs-and-pricing.md) | ต้นทุนโดยประมาณ และแนวคิดตั้งราคาถ้าจะขาย |
| [docs/legal-checklist.md](docs/legal-checklist.md) | PDPA, บัญชีรับเงิน, ภาษี, เงื่อนไขบริการที่ต้องตรวจก่อนรับเงินจริง |

## รันบนเครื่อง (ปรับให้ตรงกับโปรเจกต์จริง)

```bash
npm install
npm run dev
```

ระหว่างทำหน้าบ้านก่อนที่ API จะเสร็จ ให้ mock ตาม `docs/api-contract.md` (เช่น MSW)

## ข้อควรระวัง

- repo นี้ควรเป็น **Private** เอกสารมีแผนราคาและต้นทุน
- **ห้าม commit ความลับ**: connection string, LINE channel token, key บริการตรวจสลิป, เลข PromptPay จริง ให้ใช้ environment variable
- ข้อมูลนักวิ่งมีข้อมูลส่วนบุคคลและข้อมูลสุขภาพ ดู `docs/legal-checklist.md`
