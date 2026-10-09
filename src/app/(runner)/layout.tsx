/** เลย์เอาต์ฝั่งนักวิ่ง: mobile-first กว้างสุด 520px ตามดีไซน์ (390px) */
export default function RunnerLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-5 pt-5 pb-12">
      {children}
    </div>
  )
}
