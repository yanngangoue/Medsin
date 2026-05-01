import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { LandingHighlights } from "@/components/LandingHighlights";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-teal-50/80 to-[var(--background)]">
      <Navbar />
      <div className="flex-1">
        <HeroSection />
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <HowItWorks />
          <LandingHighlights />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
