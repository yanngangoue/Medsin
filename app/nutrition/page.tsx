import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { CTANutrition } from "@/components/nutrition/CTANutrition";
import { FAQNutrition } from "@/components/nutrition/FAQNutrition";
import { HeroNutrition } from "@/components/nutrition/HeroNutrition";
import { HowItWorksNutrition } from "@/components/nutrition/HowItWorksNutrition";
import { ProductCards } from "@/components/nutrition/ProductCards";
import { TestimonialsNutrition } from "@/components/nutrition/TestimonialsNutrition";
import { TrustBar } from "@/components/nutrition/TrustBar";

export const metadata: Metadata = {
  title: "Nutri+ — Compléments nutritionnels | MedSim",
  description:
    "Compléments sélectionnés par des nutritionnistes québécois, adaptés à votre profil de santé. Livraison au Québec, sans engagement.",
};

export default function NutritionPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans text-[#6B7280] antialiased">
      <HeroNutrition />
      <TrustBar />
      <HowItWorksNutrition />
      <ProductCards />
      <TestimonialsNutrition />
      <FAQNutrition />
      <CTANutrition />
      <Footer />
    </div>
  );
}
