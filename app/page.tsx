import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { BentoGrid } from "@/components/marketing/bento-grid"
import { Footer } from "@/components/marketing/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f1de]">
      <Navbar />
      <Hero />
      <BentoGrid />
      <div className="flex-1" />
      <Footer />
    </div>
  )
}
