import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "หลังบ้าน", template: "%s · หลังบ้าน HUEB RUN" },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children
}
