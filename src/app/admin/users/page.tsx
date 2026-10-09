import type { Metadata } from "next"
import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = { title: "ผู้ใช้ & สิทธิ์" }

export default function UsersPage() {
  return <PagePlaceholder title="ผู้ใช้ & สิทธิ์" design="Users.dc.html" />
}
