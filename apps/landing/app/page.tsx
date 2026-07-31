import ScrollProgress from "@/components/ScrollProgress";
import SectionNav from "@/components/SectionNav";
import SiteNav from "@/components/SiteNav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import MetricsSection from "@/components/metrics/MetricsSection";
import Limits from "@/components/Limits";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <ScrollProgress />
      <SiteNav />
      <SectionNav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Features />
        <HowItWorks />
        <MetricsSection />
        <Limits />
      </main>
      <Footer />
    </div>
  );
}
