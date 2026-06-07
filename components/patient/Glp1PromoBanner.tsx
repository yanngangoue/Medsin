"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ELIGIBILITY_QUESTIONNAIRE_PATH,
  GLP1_PEN_VISUALS,
  type Glp1PenVisual,
} from "@/lib/patient/promo-banner-assets";

type Props = {
  href?: string;
  className?: string;
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
    <div className={`flex shrink-0 justify-center ${tilt}`}>
      <Image
        src={pen.src}
        alt={pen.alt}
        width={220}
        height={560}
        unoptimized
        style={{ transform }}
        className="h-[min(240px,42vw)] w-auto max-h-[300px] object-contain object-center drop-shadow-[0_18px_36px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none motion-reduce:!transform-none"
        sizes="(max-width: 640px) 42vw, 220px"
      />
    </div>
  );
}

function VerticalPenColumn({
  side,
  direction,
  hovered,
  offset,
}: {
  side: "left" | "right";
  direction: "down" | "up";
  hovered: boolean;
  offset: CursorOffset;
}) {
  const loop = [...GLP1_PEN_VISUALS, ...GLP1_PEN_VISUALS, ...GLP1_PEN_VISUALS];
  const maskClass =
    side === "left" ? "promo-banner-side-mask--left" : "promo-banner-side-mask--right";

  return (
    <div
      className={`promo-banner-side-mask ${maskClass} pointer-events-none absolute top-0 bottom-0 w-[34%] overflow-hidden sm:w-[30%] md:w-[26%] ${
        side === "left" ? "left-0" : "right-0"
      }`}
      aria-hidden
    >
      <div
        className={`promo-banner-vertical-track flex flex-col items-center gap-14 py-8 ${
          direction === "up" ? "promo-banner-vertical-track--up" : ""
        }`}
      >
        {loop.map((pen, index) => (
          <PenVisual
            key={`${side}-${pen.id}-${index}`}
            pen={pen}
            side={side}
            hovered={hovered}
            offset={offset}
          />
        ))}
      </div>
    </div>
  );
}

export function Glp1PromoBanner({
  href = ELIGIBILITY_QUESTIONNAIRE_PATH,
  className = "",
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
      className={`promo-banner-root group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a5c45] via-[#1D4D3A] to-[#7fd4b0] shadow-xl ${className}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <VerticalPenColumn side="left" direction="down" hovered={hovered} offset={offset} />
      <VerticalPenColumn side="right" direction="up" hovered={hovered} offset={offset} />

      <div className="pointer-events-none relative z-10 flex min-h-[260px] flex-col items-center justify-center px-6 py-9 text-center sm:min-h-[300px] sm:px-10 md:min-h-[320px] md:px-16">
        <p className="text-xs font-medium text-white/90 sm:text-sm">
          Prêt pour un vrai changement ?
        </p>
        <h2 className="mt-2 max-w-sm text-base font-bold leading-snug tracking-tight text-white drop-shadow-md sm:max-w-md sm:text-lg md:text-xl lg:text-2xl">
          Ozempic, Wegovy et Mounjaro — prescrits par une IPS au Québec
        </h2>
        <Link
          href={href}
          className="pointer-events-auto mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-[#1D4D3A] shadow-lg transition hover:bg-white/95 sm:text-sm"
        >
          Commencer gratuitement
        </Link>
      </div>
    </div>
  );
}
