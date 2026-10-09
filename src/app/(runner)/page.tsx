import { Suspense } from "react"
import { DistanceCards } from "@/features/home/components/distance-cards"
import { Hero } from "@/features/home/components/hero"
import {
  FaqSection,
  SectionHeading,
  SiteFooter,
  SouvenirSection,
  StepsSection,
} from "@/features/home/components/sections"
import { MobileCta } from "@/features/home/components/mobile-cta"
import { SiteHeader } from "@/features/home/components/site-header"
import { getDistances, getEvent } from "@/features/registration/api"

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-[#f4f8ff] via-white to-white pb-20 lg:pb-0">
      <SiteHeader />
      <main className="flex flex-col">
        <Suspense fallback={<div className="min-h-[80vh]" />}>
          <HeroWithEvent />
        </Suspense>

        <section className="mx-auto w-full max-w-6xl px-5 py-10 lg:py-14">
          <div className="flex flex-col gap-8">
            <SectionHeading id="distances">เลือกระยะที่ใช่สำหรับคุณ</SectionHeading>
            <Suspense fallback={<div className="h-32 animate-pulse rounded-3xl bg-muted" />}>
              <DistanceList />
            </Suspense>
          </div>
        </section>

        <SouvenirSection />
        <StepsSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <MobileCta />
    </div>
  )
}

async function HeroWithEvent() {
  const event = await getEvent()
  return <Hero event={event} />
}

async function DistanceList() {
  const distances = await getDistances()
  return <DistanceCards distances={distances} />
}
