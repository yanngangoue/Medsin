import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MedsimLogo } from "@/components/MedsimLogo";
import { GestionPoidsCommunityGallery } from "@/components/onboarding/GestionPoidsCommunityGallery";
import { GestionPoidsHowItWorks } from "@/components/onboarding/GestionPoidsHowItWorks";
import { GestionPoidsScience } from "@/components/onboarding/GestionPoidsScience";
import { GestionPoidsCommencerSection } from "@/components/onboarding/GestionPoidsCommencerSection";

export function GestionPoidsLanding() {
  return (
    <div className="flex flex-col bg-[#F5F0EB]">
      <div className="bg-[var(--teal-900)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Accompagnement GLP-1 encadré par des professionnels de santé
      </div>

      <header className="border-b border-[#E8E0D8]/80 bg-[#F5F0EB]/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <MedsimLogo className="text-xl" />
          </Link>
          <nav className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-wide text-slate-800 sm:flex sm:text-[11px]">
            <a href="#galerie" className="hover:text-[#1D9E75]">
              Notre communauté
            </a>
            <a href="#comprendre-glp1" className="hover:text-[#1D9E75]">
              Comprendre le GLP-1
            </a>
            <a href="#comment-ca-marche" className="hover:text-[#1D9E75]">
              Comment ça marche
            </a>
            <a href="#commencer" className="hover:text-[#1D9E75]">
              Commencer
            </a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/connexion?callbackUrl=/onboarding/gestion-poids"
              className="text-sm font-medium text-slate-700 hover:text-[#1D9E75]"
            >
              Se connecter
            </Link>
            <a
              href="#commencer"
              className="rounded-md bg-[var(--teal-900)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
            >
              Commencer
            </a>
          </div>
        </div>
      </header>

      <section id="galerie" className="relative overflow-hidden bg-[#F5F0EB] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">MedSim</p>
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
