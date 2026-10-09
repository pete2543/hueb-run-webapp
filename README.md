# HuebRun (ชื่อชั่วคราว)

ระบบรับสมัครงานเดิน-วิ่ง: หน้าลงทะเบียนสำหรับนักวิ่ง, หลังบ้านสำหรับผู้จัด, แจ้งเตือนผ่าน LINE OA
เริ่มจากงานเดียว (~1,000 คน, ระยะ 3 / 5 / 10 กม.) ออกแบบให้ใช้ซ้ำข้ามปีได้ และขยายเป็นผลิตภัณฑ์ขายผู้จัดอื่นได้ในอนาคต

> สถานะ: **ตั้งโครงหน้าเว็บแล้ว** (ทุกหน้ายังเป็น placeholder) มี DB schema (ยังไม่ได้ compile/migrate) และเดโม UI แบบคลิกดู flow
> ข้อมูลทุกอย่างในเดโมเป็นตัวอย่าง ราคา/ต้นทุนในเอกสารเป็นการประมาณ ยังไม่ได้ตรวจกับแหล่งจริง

## สแตกที่ตัดสินใจแล้ว

| ส่วน                      | เทคโนโลยี                                                            |
| ------------------------- | -------------------------------------------------------------------- |
| หน้าบ้าน + หลังบ้านแอดมิน | Next.js (TypeScript), Tailwind CSS, shadcn/ui                        |
| ฟอร์ม                     | React Hook Form + Zod                                                |
| 3D (เฉพาะหน้าแลนดิ้ง)     | React Three Fiber + Drei (lazy load, มี fallback)                    |
| API                       | C# ASP.NET Core Web API, EF Core                                     |
| ฐานข้อมูล                 | PostgreSQL                                                           |
| งานเบื้องหลัง             | Hangfire (ใช้ DB เดิม ไม่ใช้ Redis/RabbitMQ)                         |
| ชำระเงิน                  | PromptPay QR + ตรวจสลิปอัตโนมัติ (เฟส 1), payment gateway (เฟสถัดไป) |
| แจ้งเตือน                 | LINE Messaging API + LINE Login/LIFF                                 |
| CDN / กันโหลด             | Cloudflare                                                           |

## เอกสาร

| ไฟล์                                                   | เนื้อหา                                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [docs/plan.md](docs/plan.md)                           | การตัดสินใจทั้งหมด, สถาปัตยกรรม, flow, roadmap, ความเสี่ยง, เรื่องที่ยังไม่ตัดสินใจ |
| [docs/design/](docs/design/)                           | ไฟล์ดีไซน์ 18 หน้าจอ ดึงมาจาก Design canvas                                         |
| [docs/ui-flow.md](docs/ui-flow.md)                     | รายการหน้าจอ 18 หน้า, เส้นทาง URL ที่เสนอ, design tokens                            |
| [docs/api-contract.md](docs/api-contract.md)           | ร่าง endpoint ที่หน้าเว็บต้องใช้ (ใช้ทำ mock ระหว่างทำหน้าบ้านก่อน)                 |
| [docs/db-schema/](docs/db-schema/)                     | EF Core entities + DbContext + seed (ใช้อ้างอิง ไม่ใช่โค้ดที่ build ใน repo นี้)    |
| [docs/costs-and-pricing.md](docs/costs-and-pricing.md) | ต้นทุนโดยประมาณ และแนวคิดตั้งราคาถ้าจะขาย                                           |
| [docs/legal-checklist.md](docs/legal-checklist.md)     | PDPA, บัญชีรับเงิน, ภาษี, เงื่อนไขบริการที่ต้องตรวจก่อนรับเงินจริง                  |

## รันบนเครื่อง

ต้องใช้ Node.js 20.9 ขึ้นไป (โปรเจกต์ตั้งไว้ที่ 22 ใน `.nvmrc`)

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

เปิด http://localhost:3000 (นักวิ่ง) และ http://localhost:3000/admin (หลังบ้าน)

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | รันโหมดพัฒนา (Turbopack) |
| `npm run build` / `npm start` | build และรันแบบ production |
| `npm run lint` | ESLint |
| `npm run typecheck` | สร้าง type ของ route แล้วตรวจ TypeScript |
| `npm run format` | จัดรูปโค้ดด้วย Prettier (เรียงคลาส Tailwind ให้ด้วย) |

ระหว่างทำหน้าบ้านก่อนที่ API จะเสร็จ ให้ mock ตาม `docs/api-contract.md` (เช่น MSW)

## โครงสร้างโค้ด

Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui (Base UI) เปิด Cache Components ตามค่าเริ่มต้นของ Next 16

```
src/
├─ app/                      เส้นทาง URL เท่านั้น (page / layout) ไม่ใส่ logic หนัก
│  ├─ layout.tsx             root: ฟอนต์ Prompt + Noto Sans Thai, lang="th"
│  ├─ globals.css            design tokens (สีจาก docs/ui-flow.md)
│  ├─ (runner)/              ฝั่งนักวิ่ง mobile-first ── วงเล็บ = ไม่อยู่ใน URL
│  │  ├─ page.tsx            /                       หน้าแรก
│  │  └─ register/           /register/...           ขั้นตอนสมัคร 1–4 + สำเร็จ
│  └─ admin/                 /admin/...              หลังบ้าน (เมนูซ้าย)
├─ features/                 โค้ดแยกตามเรื่อง ใช้ร่วมกันหลายหน้า
│  ├─ registration/          ขั้นตอนสมัคร, คอมโพเนนต์, (ต่อไป: schema Zod, state ของ flow)
│  └─ admin/                 เมนูหลังบ้าน, คอมโพเนนต์หลังบ้าน
├─ components/
│  └─ ui/                    คอมโพเนนต์จาก shadcn (เพิ่มด้วย npx shadcn add <ชื่อ>)
└─ lib/                      ของกลาง: api/client.ts (เรียก API), format.ts, utils.ts
```

หลักง่าย ๆ: **หน้าไหนใช้คนเดียว** วางไว้ข้างหน้านั้นใน `app/` ได้, **ใช้ร่วมกันในเรื่องเดียว** ไว้ใน `features/<เรื่อง>/`, **ใช้ทั้งแอป** ไว้ใน `components/` หรือ `lib/`

หน้าที่มี `[orderId]` อ่านค่าได้ตอน request เท่านั้น จึงต้องห่อส่วนที่อ่าน `params` ไว้ใน `<Suspense>` (กติกาของ Cache Components)

## ข้อควรระวัง

- repo นี้ควรเป็น **Private** เอกสารมีแผนราคาและต้นทุน
- **ห้าม commit ความลับ**: connection string, LINE channel token, key บริการตรวจสลิป, เลข PromptPay จริง ให้ใช้ environment variable
- ข้อมูลนักวิ่งมีข้อมูลส่วนบุคคลและข้อมูลสุขภาพ ดู `docs/legal-checklist.md`
