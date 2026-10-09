import type { Metadata, Viewport } from "next"
import { Noto_Sans_Thai, Prompt } from "next/font/google"
import "./globals.css"

const prompt = Prompt({
  variable: "--font-heading",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
})

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-body",
  subsets: ["thai", "latin"],
})

export const metadata: Metadata = {
  title: {
    default: "HuebRun · สมัครงานเดิน-วิ่ง",
    template: "%s · HuebRun",
  },
  description: "สมัครงานเดิน-วิ่ง 3 / 5 / 10 กม. จ่ายด้วย PromptPay รับแจ้งเตือนทาง LINE",
}

export const viewport: Viewport = {
  themeColor: "#0b1220",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${prompt.variable} ${notoSansThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
