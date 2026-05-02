import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { StepsOverview } from "@/components/StepsOverview";
import { StepsDetail } from "@/components/StepsDetail";
import { PolicySection } from "@/components/PolicySection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <StepsOverview />
        <StepsDetail />
        <PolicySection />
      </main>
      <Footer />
    </div>
  );
}
