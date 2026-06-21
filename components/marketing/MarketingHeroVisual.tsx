"use client";

import { HoverZoomImage } from "@/components/ui/HoverZoomImage";
import { useCallback, useRef } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=90";

export function MarketingHeroVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--px", `${x * 18}px`);
    el.style.setProperty("--py", `${y * 12}px`);
  }, []);

  const onLeave = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
  }, []);

  return (
    <div
      ref={wrapRef}
      className="group relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ "--px": "0px", "--py": "0px" } as React.CSSProperties}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-2xl shadow-[#1D4D3A]/15 ring-1 ring-black/5 sm:aspect-[5/6]">
        <HoverZoomImage
          src={HERO_IMAGE}
          alt="Femme active souriante — parcours santé Anne-sante"
          fill
          priority
          zoom="subtle"
          followCursor
          groupHover
          containerClassName="absolute inset-0 size-full"
          imageClassName="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1D4D3A]/25 via-transparent to-white/5" />
      </div>

      <div
        className="absolute -left-2 top-[10%] sm:-left-5"
        style={{ transform: "translate(var(--px), var(--py))" }}
      >
        <div className="marketing-float-a max-w-[210px] rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D4D3A] text-[10px] font-bold text-white">
            −14
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#1D4D3A]">GLP-1</p>
            <p className="text-sm font-semibold text-[#1A1A2E]">14 kg en 3 mois</p>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">Sophie M. · Montréal</p>
        </div>
      </div>

      <div
        className="absolute -right-1 top-[36%] sm:-right-4"
        style={{ transform: "translate(calc(var(--px) * -1.3), calc(var(--py) * -0.9))" }}
      >
        <div className="marketing-float-b max-w-[220px] rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#3EBD93]">Coach Anne</p>
        <p className="mt-0.5 text-sm font-semibold text-[#1A1A2E]">Message proactif</p>
        <p className="mt-1 text-xs italic text-gray-500">
          « Comment vous sentez-vous cette semaine ? »
        </p>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-[250px]"
        style={{ transform: "translate(calc(var(--px) * 0.7), calc(var(--py) * -1.1))" }}
      >
        <div className="marketing-float-c rounded-2xl border border-white/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1D4D3A] text-xs font-bold text-white">
            IPS
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#10B981] animate-pulse-dot" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1A1A2E]">Ordonnance approuvée</p>
            <p className="text-xs text-gray-500">Livraison sous 48 h · discrète</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
