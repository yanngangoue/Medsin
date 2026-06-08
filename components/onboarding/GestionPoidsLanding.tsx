import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PartNavAccueilLink } from "@/components/patient/PartNavAccueilLink";
import { GestionPoidsCommunityGallery } from "@/components/onboarding/GestionPoidsCommunityGallery";
import { GestionPoidsHowItWorks } from "@/components/onboarding/GestionPoidsHowItWorks";
import { GestionPoidsScience } from "@/components/onboarding/GestionPoidsScience";
import { GestionPoidsCommencerSection } from "@/components/onboarding/GestionPoidsCommencerSection";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

export function GestionPoidsLanding() {
  return (
    <div className="flex flex-col bg-[#F5F0EB]">
      <div className="bg-[var(--teal-900)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Accompagnement GLP-1 encadré par des professionnels de santé
      </div>

      <header className="border-b border-[#E8E0D8]/80 bg-[#F5F0EB]/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4 sm:gap-8">
          <Link href={PUBLIC_CATALOG_HOME} className="shrink-0" aria-label="MedSim — accueil">
            <MedsimLogo />
          </Link>
          <PartNavAccueilLink className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#1D9E75] hover:text-[var(--teal-900)] sm:hidden" />
          <nav
            className="hidden flex-1 items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-wide text-slate-800 sm:flex sm:gap-10 sm:text-[11px]"
            aria-label="Sections de la page"
          >
            <PartNavAccueilLink className="text-slate-800 hover:text-[#1D9E75]" />
            <a href="#galerie" className="hover:text-[#1D9E75]">
              Notre communauté
            </a>
            <a href="#comprendre-glp1" className="hover:text-[#1D9E75]">
              Comprendre le GLP-1
            </a>
            <a href="#comment-ca-marche" className="hover:text-[#1D9E75]">
              Comment ça marche
            </a>
          </nav>
        </div>
      </header>

      <section id="galerie" className="relative overflow-hidden bg-[#F5F0EB] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <MedsimLogo className="h-7 sm:h-8" />
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-3xl">
            Gestion du poids avec GLP-1
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Rejoignez des milliers de personnes qui avancent vers leurs objectifs avec un accompagnement
            médical encadré.
          </p>
        </div>

        <GestionPoidsCommunityGallery className="mt-8 sm:mt-10" />
      </section>

      <GestionPoidsScience />
      <GestionPoidsHowItWorks />
      <GestionPoidsCommencerSection />
      <Footer />
    </div>
  );
}
