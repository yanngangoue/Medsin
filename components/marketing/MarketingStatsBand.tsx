"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  end: number;
  suffix: string;
  prefix?: string;
  label: string;
  decimals?: number;
};

const STATS: Stat[] = [
  { end: 2400, suffix: "+", label: "Patients accompagnés" },
  { end: 98, suffix: " %", label: "Satisfaction" },
  { end: 24, suffix: " h", label: "Réponse IPS" },
  { end: 150, suffix: "+", label: "Professionnels actifs" },
];

function formatValue(current: number, stat: Stat): string {
  const n = stat.decimals ? current.toFixed(stat.decimals) : Math.round(current).toLocaleString("fr-CA");
  return `${stat.prefix ?? ""}${n}${stat.suffix}`;
}

function AnimatedStat({ stat, active }: { stat: Stat; active: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(stat.end * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, stat.end]);

  return (
    <div className="text-center md:border-l md:border-white/10 md:first:border-l-0">
      <p className="font-display text-3xl font-black tabular-nums tracking-tight text-white sm:text-4xl lg:text-5xl">
        {formatValue(value, stat)}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/60 sm:text-sm">
        {stat.label}
      </p>
    </div>
  );
}

export function MarketingStatsBand() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-white/10 bg-[#0a1f14] py-12 text-white sm:py-14"
      aria-label="Statistiques"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(62,189,147,0.12)_0%,_transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-10 px-5 md:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <AnimatedStat key={stat.label} stat={stat} active={active} />
        ))}
      </div>
    </section>
  );
}
