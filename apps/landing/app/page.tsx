import ScrollProgress from "@/components/ScrollProgress";
import SectionNav from "@/components/SectionNav";
import FloatingBrand from "@/components/FloatingBrand";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Limits from "@/components/Limits";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <ScrollProgress />
      <FloatingBrand />
      <SectionNav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Features />
        <HowItWorks />
        <Limits />
      </main>
      <Footer />
    </div>
  );
}
