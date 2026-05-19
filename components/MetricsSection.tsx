"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function IconWeight({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="13" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 13V9M15 13V9M12 9V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSleep({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconActivity({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBalance({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v18M5 21h14M8 9h8M8 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const METRICS = [
  { key: "poids", label: "Poids", hint: "Tendance 12 sem.", pct: 78, Icon: IconWeight },
  { key: "sommeil", label: "Sommeil", hint: "Score qualité", pct: 72, Icon: IconSleep },
  { key: "activite", label: "Activité", hint: "Minutes actives", pct: 64, Icon: IconActivity },
  { key: "equilibre", label: "Équilibre métabolique", hint: "Synthèse clinique", pct: 81, Icon: IconBalance },
] as const;

function DashboardPreview() {
  return (
    <div
      id="metabo-dashboard-preview"
      className="mt-10 rounded-[14px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8"
      role="region"
      aria-label="Exemple illustratif de tableau de bord MetaboTrack"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-soft)] pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gray-muted)]">MetaboTrack</p>
          <p className="text-[15px] font-bold text-[var(--gray-900)]">Aperçu (démonstration)</p>
        </div>
        <span className="rounded-[20px] bg-[var(--teal-light)] px-3 py-1 text-[11px] font-medium text-[var(--teal)]">
          Données fictives
        </span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[10px] bg-[var(--teal-light)]/60 p-4">
          <p className="text-[12px] text-[var(--gray-muted)]">Poids (7 j.)</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-[var(--gray-900)]">−2,4 kg</p>
        </div>
        <div className="rounded-[10px] bg-[var(--teal-light)]/60 p-4">
          <p className="text-[12px] text-[var(--gray-muted)]">Sommeil</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-[var(--gray-900)]">7h12</p>
        </div>
        <div className="rounded-[10px] bg-[var(--teal-light)]/60 p-4">
          <p className="text-[12px] text-[var(--gray-muted)]">Glycémie à jeun</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-[var(--gray-900)]">5,2</p>
        </div>
      </div>
      <div className="mt-6 h-32 rounded-[10px] bg-gradient-to-b from-[var(--teal-light)] to-white p-4 ring-1 ring-[var(--teal-mid)]/30">
        <p className="text-[11px] font-medium text-[var(--gray-muted)]">Énergie & activité (exemple)</p>
        <svg className="mt-3 h-20 w-full" viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden>
          <path
            d="M0 60 L40 45 L80 55 L120 30 L160 38 L200 22 L240 28 L280 15 L320 20"
            fill="none"
            stroke="#1a9e7a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path d="M0 70 H320" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

export function MetricsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const openDemo = useCallback(() => {
    setShowDemo(true);
    requestAnimationFrame(() => {
      document.getElementById("metabo-dashboard-preview")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  return (
    <section
      ref={rootRef}
      className="border-t border-[var(--border-soft)] bg-white py-14 sm:py-20"
      aria-labelledby="metrics-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="metrics-heading" className="text-[26px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            Mesurez vos progrès, en toute sécurité
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--gray-muted)] sm:text-[16px]">
            Votre tableau de bord MetaboTrack vous aide à suivre poids, énergie, qualité du sommeil et glycémie, tout en
            garantissant la confidentialité complète de vos données.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(({ key, label, hint, pct, Icon }, i) => (
            <div
              key={key}
              className="flex flex-col rounded-[14px] border border-[var(--border-soft)] bg-[#fafcfb] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white text-[var(--teal)] shadow-sm ring-1 ring-[var(--teal-mid)]/35">
                  <Icon />
                </span>
                <span
                  className={`text-[20px] font-bold tabular-nums text-[var(--teal)] transition-opacity duration-700 ${
                    inView ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {inView ? `${pct}%` : "—"}
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-[var(--gray-900)]">{label}</h3>
              <p className="mt-1 text-[12px] text-[var(--gray-muted)]">{hint}</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--teal-mid)]/25">
                <div
                  className="h-full rounded-full bg-[var(--teal)] transition-[width] duration-[1.35s] ease-out"
                  style={{
                    width: inView ? `${pct}%` : "0%",
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[12px] leading-relaxed text-neutral-500 sm:text-[13px]">
          Données hébergées au Canada – conformes à la Loi&nbsp;25
        </p>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={openDemo}
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--teal)] bg-white px-6 py-3 text-[14px] font-semibold text-[var(--teal)] shadow-sm transition hover:bg-[var(--teal-light)] hover:opacity-95 hover:[transform:scale(1.02)] active:scale-[0.99]"
          >
            Voir un exemple de tableau de bord
          </button>
        </div>

        {showDemo ? <DashboardPreview /> : null}
      </div>
    </section>
  );
}
