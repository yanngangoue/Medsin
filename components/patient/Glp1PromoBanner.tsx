"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { MEDSIM_BRAND } from "@/lib/brand/medsim-logo";
import {
  ELIGIBILITY_QUESTIONNAIRE_PATH,
  GLP1_PEN_VISUALS,
  type Glp1PenVisual,
} from "@/lib/patient/promo-banner-assets";

type Props = {
  href?: string;
  className?: string;
  topNav?: ReactNode;
};

type CursorOffset = { x: number; y: number };

function PenVisual({
  pen,
  side,
  hovered,
  offset,
}: {
  pen: Glp1PenVisual;
  side: "left" | "right";
  hovered: boolean;
  offset: CursorOffset;
}) {
  const tilt = side === "left" ? "-rotate-[14deg]" : "rotate-[14deg]";
  const parallaxX = offset.x * (side === "left" ? 1 : -1);
  const scale = hovered ? 1.1 : 1;
  const transform = hovered
    ? `translate(${parallaxX}%, ${offset.y}%) scale(${scale})`
    : undefined;

  return (
    <div className={`promo-banner-pen-wrap flex shrink-0 justify-center origin-center ${tilt}`}>
      <Image
        src={pen.src}
        alt={pen.alt}
        width={300}
        height={760}
        unoptimized
        style={transform ? { transform } : undefined}
        className="promo-banner-pen-visual object-contain object-center drop-shadow-[0_18px_36px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none motion-reduce:!transform-none"
        sizes="(max-width: 640px) 38vw, 180px"
      />
    </div>
  );
}

function buildPenSequence(side: "left" | "right"): Glp1PenVisual[] {
  const pens = [...GLP1_PEN_VISUALS];
  const ordered =
    side === "right" ? [pens[1], pens[2], pens[0]] : pens;
  return [...ordered, ...ordered];
}

function VerticalPenColumn({
  side,
  hovered,
  offset,
}: {
  side: "left" | "right";
  hovered: boolean;
  offset: CursorOffset;
}) {
  const loop = buildPenSequence(side);
  const maskClass =
    side === "left" ? "promo-banner-side-mask--left" : "promo-banner-side-mask--right";

  return (
    <div
      className={`promo-banner-side-mask ${maskClass} pointer-events-none absolute top-0 bottom-0 w-[48%] overflow-hidden sm:w-[44%] md:w-[40%] ${
        side === "left" ? "left-0" : "right-0"
      }`}
      aria-hidden
    >
      <div
        className={`promo-banner-vertical-track flex flex-col items-center ${
          side === "right" ? "promo-banner-vertical-track--fall-alt" : ""
        }`}
      >
        {loop.map((pen, index) => (
          <div key={`${side}-${pen.id}-${index}`} className="promo-banner-pen-slot">
            <PenVisual pen={pen} side={side} hovered={hovered} offset={offset} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Glp1PromoBanner({
  href = ELIGIBILITY_QUESTIONNAIRE_PATH,
  className = "",
  topNav,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [offset, setOffset] = useState<CursorOffset>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: x * 8, y: y * 8 });
  }, []);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      id="patient-hero-banner"
      className={`promo-banner-root group relative w-full overflow-x-hidden overflow-y-visible rounded-2xl bg-gradient-to-br from-[#1a5c45] via-[#1D4D3A] to-[#7fd4b0] shadow-lg shadow-black/10 ${className}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className="promo-banner-watermark pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
        aria-hidden
      >
        {MEDSIM_BRAND.name}
      </div>

      <VerticalPenColumn side="left" hovered={hovered} offset={offset} />
      <VerticalPenColumn side="right" hovered={hovered} offset={offset} />

      {topNav ? (
        <div className="relative z-20 overflow-visible px-3 pb-1.5 pt-2 sm:px-4 sm:pb-2 sm:pt-2.5">{topNav}</div>
      ) : null}

      <div className="pointer-events-none relative z-10 flex min-h-[min(40vh,300px)] flex-col items-center justify-center px-5 py-6 text-center sm:min-h-[min(44vh,340px)] sm:px-8 sm:py-7 md:min-h-[min(46vh,360px)] md:px-10 lg:min-h-[min(48vh,380px)]">
        <p className="max-w-lg text-base font-medium text-white/90 sm:max-w-xl sm:text-lg md:text-xl">
          Reprenez le contrôle de votre poids, pour de bon avec Anne-sante
        </p>
        <h2 className="mt-4 max-w-lg text-balance px-1 text-2xl font-bold leading-snug tracking-tight text-white drop-shadow-md sm:max-w-xl sm:px-0 sm:text-3xl md:max-w-2xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          Une nouvelle façon de vivre les soins de perte de poids.
        </h2>
        <Link
          href={href}
          className="pointer-events-auto mt-6 inline-flex items-center justify-center rounded-xl border border-white/70 bg-transparent px-7 py-3 text-sm font-semibold text-white shadow-none transition hover:border-white hover:bg-white/10 sm:px-8 sm:text-base"
        >
          Commencer gratuitement
        </Link>
      </div>
    </div>
  );
}
