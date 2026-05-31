import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { StepsOverview } from "@/components/StepsOverview";
import { StepsDetail } from "@/components/StepsDetail";
import { WhyMedsimSection } from "@/components/WhyMedsimSection";
import { MetabolicHealthSection } from "@/components/MetabolicHealthSection";
import { AIAssistantSection } from "@/components/AIAssistantSection";
import { NutritionSection } from "@/components/NutritionSection";
import { MetricsSection } from "@/components/MetricsSection";
import { PolicySection } from "@/components/PolicySection";
import { Footer } from "@/components/Footer";

/** Landing marketing (accessible via /landing quand la carte projet est sur / en dev). */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <StepsOverview />
        <StepsDetail />
        <WhyMedsimSection />
        <MetabolicHealthSection />
        <AIAssistantSection />
        <NutritionSection />
        <MetricsSection />
        <PolicySection />
      </main>
      <Footer />
    </div>
  );
}
