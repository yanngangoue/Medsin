"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketingHeroVisual } from "@/components/marketing/MarketingHeroVisual";
import { APP_BRAND } from "@/lib/brand/app-brand";

const SERVICES = [
  { id: "glp1", label: "Gestion du poids GLP-1", active: true, href: "/eligibilite" },
  { id: "coach", label: `Coach ${APP_BRAND.coachName}`, active: true, href: "#coach-anne" },
  { id: "nutrition", label: "Nutrition métabolique", active: false, href: null },
] as const;

export function MarketingHero() {
  const [activeService, setActiveService] = useState("glp1");

  return (
    <section className="marketing-hero-bg relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
      <div className="marketing-hero-orb marketing-hero-orb-a" aria-hidden />
      <div className="marketing-hero-orb marketing-hero-orb-b" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="marketing-hero-in inline-flex items-center gap-2 rounded-full border border-[#1D4D3A]/15 bg-white/80 px-4 py-1.5 text-sm font-medium text-[#1D4D3A] shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#3EBD93] animate-pulse-dot" aria-hidden />
            Rejoignez 2 400+ patients {APP_BRAND.name}
          </p>

          <h1 className="marketing-hero-in marketing-hero-in-d1 mt-6 font-display text-[2.75rem] font-black leading-[1.02] tracking-tight text-[#1A1A2E] sm:text-6xl lg:text-[4.25rem]">
            Les soins de santé,
            <br />
            <span className="bg-gradient-to-r from-[#1D4D3A] to-[#3EBD93] bg-clip-text text-transparent">
              repensés pour la vraie vie.
            </span>
          </h1>

          <p className="marketing-hero-in marketing-hero-in-d2 mt-6 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
            Soins médicaux en ligne — simples, directs et encadrés par des professionnels
            licenciés. Pas de salle d&apos;attente. Juste des soins qui fonctionnent.
          </p>

          <div className="marketing-hero-in marketing-hero-in-d3 mt-8 flex flex-wrap gap-2">
            {SERVICES.map((service) => {
              const isActive = activeService === service.id;
              if (!service.active) {
                return (
                  <span
                    key={service.id}
                    className="cursor-not-allowed rounded-full border border-dashed border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400"
                    title="Bientôt disponible"
                  >
                    {service.label}
                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide">
                      Bientôt
                    </span>
                  </span>
                );
              }
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveService(service.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[#1D4D3A] text-white shadow-md shadow-[#1D4D3A]/20 scale-[1.02]"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-[#1D4D3A]/30"
                  }`}
                >
                  {service.label}
                </button>
              );
            })}
          </div>

          <div className="marketing-hero-in marketing-hero-in-d4 mt-8 flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/eligibilite"
              className="group inline-flex items-center rounded-full bg-[#1D4D3A] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1D4D3A]/25 transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] sm:text-base"
            >
              Commencer
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="#calculateur-imc"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white/90 px-8 py-3.5 text-sm font-semibold text-[#1A1A2E] backdrop-blur-sm transition hover:border-gray-300 hover:bg-white sm:text-base"
            >
              Calculer mon IMC
            </Link>
          </div>
        </div>

        <div className="marketing-hero-in marketing-hero-in-d2">
          <MarketingHeroVisual />
        </div>
      </div>
    </section>
  );
}
