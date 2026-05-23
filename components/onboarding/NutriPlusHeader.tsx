"use client";

import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { useNutriPlusPlan } from "@/components/onboarding/NutriPlusPlanContext";
import { PartNavAccueilLink } from "@/components/patient/PartNavAccueilLink";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

/** En-tête Nutri+ — navigation orientée accompagnement. */
export function NutriPlusHeader() {
  const { openPlan } = useNutriPlusPlan();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0D8]/80 bg-[#F5F0EB]/95 px-4 py-3 backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-4 sm:gap-8">
        <Link href={PUBLIC_CATALOG_HOME} className="shrink-0" aria-label="MedSim — accueil">
          <MedsimLogo className="text-xl" />
        </Link>
        <PartNavAccueilLink className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#1D9E75] hover:text-[var(--teal-900)] sm:hidden" />
        <nav
          className="hidden flex-1 items-center justify-center gap-5 text-[10px] font-semibold uppercase tracking-wide text-slate-800 sm:flex sm:gap-6 sm:text-[11px]"
          aria-label="Sections de la page"
        >
          <a href="#accueil" className="hover:text-[#1D9E75]">
            Accueil
          </a>
          <a href="#nutri-plus" className="hover:text-[#1D9E75]">
            Nutri+
          </a>
          <a href="#comprendre-nutrition" className="hover:text-[#1D9E75]">
            Votre parcours
          </a>
          <a href="#comment-ca-marche" className="hover:text-[#1D9E75]">
            Comment ça marche
          </a>
          <a href="#commencer" className="hover:text-[#1D9E75]">
            Commencer
          </a>
          <button
            type="button"
            onClick={openPlan}
            className="font-bold text-[#1D9E75] hover:text-[var(--teal-900)]"
          >
            Mon plan
          </button>
        </nav>
      </div>
    </header>
  );
}
