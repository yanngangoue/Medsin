import type { ReactNode } from "react";

const DEMO_KPIS = [
  { label: "Poids perdu", value: "−18,7 lb", hint: "Depuis le début", trend: "down" as const },
  { label: "Objectif", value: "68 %", hint: "Progression vers la cible", trend: "up" as const },
  { label: "Énergie", value: "4,2 / 5", hint: "Moyenne cette semaine", trend: "up" as const },
  { label: "Semaine", value: "12", hint: "De votre programme GLP-1", trend: "neutral" as const },
] as const;

/** Poids hebdomadaire en livres (équivalent ~92–80,5 kg). */
const CHART_POINTS = [
  203, 200, 196, 194, 191, 189, 186, 184, 183, 181, 180, 178,
] as const;

const CHART_MIN_LB = 172;
const CHART_MAX_LB = 208;

const INCLUSIONS = [
  {
    image: "/images/glp1-process-traitement-perso.webp",
    imageAlt: "Stylos injectables GLP-1 pour un traitement personnalisé",
    title: (
      <>
        Traitement <span className="text-[#1D4D3A]">personnalisé</span>
      </>
    ),
    body: "Prescrit par un professionnel de santé selon votre profil — Ozempic, Wegovy ou générique.",
  },
  {
    image: "/images/glp1-process-suivi-anne.webp",
    imageAlt: "Clavardage avec Anne, coach santé IA MedSim",
    title: (
      <>
        <span className="text-[#1D4D3A]">Suivi proactif</span> avec assistance 24 h/24, 7 jours/7
      </>
    ),
    body: "Anne, votre coach IA, vous contacte chaque semaine. Notre équipe est là quand vous en avez besoin.",
  },
  {
    image: "/images/glp1-process-en-ligne.webp",
    imageAlt: "Tableau de bord MedSim sur tablette",
    title: (
      <>
        <span className="text-[#1D4D3A]">Tableau de bord</span> personnalisé
      </>
    ),
    body: "Suivez votre évolution, vos KPI et votre progression vers votre objectif, au même endroit.",
  },
] as const;

type Props = {
  prenom?: string;
};

function InclusionCard({
  image,
  imageAlt,
  title,
  body,
}: {
  image: string;
  imageAlt: string;
  title: ReactNode;
  body: string;
}) {
  return (
    <li className="overflow-hidden rounded-[20px] bg-[#F5F4F0] shadow-sm ring-1 ring-black/5 sm:rounded-[24px]">
      <div className="flex min-h-[9.5rem] flex-col sm:min-h-[10.5rem] sm:flex-row">
        <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[38%] sm:min-h-[10.5rem]">
          <img
            src={image}
            alt={imageAlt}
            width={800}
            height={800}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center px-5 py-4 text-left sm:px-6 sm:py-5">
          <h3 className="text-lg font-bold leading-snug text-[#1A1A2E] sm:text-xl">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{body}</p>
        </div>
      </div>
    </li>
  );
}

function TrendBadge({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "neutral") return null;
  const isUp = trend === "up";
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
        isUp ? "bg-emerald-100 text-emerald-700" : "bg-emerald-100 text-emerald-700"
      }`}
      aria-hidden
    >
      {isUp ? "↑" : "↓"}
    </span>
  );
}

export function PatientDashboardKpiSection({ prenom }: Props) {
  const greetingName = prenom?.trim() || "Marie";

  const chartPath = CHART_POINTS.map((y, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * 100;
    const normalizedY =
      100 - ((y - CHART_MIN_LB) / (CHART_MAX_LB - CHART_MIN_LB)) * 100;
    return `${i === 0 ? "M" : "L"} ${x} ${normalizedY}`;
  }).join(" ");

  return (
    <section
      id="tableau-de-bord"
      className="scroll-mt-24 border-t border-white/15 py-12 sm:py-16"
      aria-labelledby="dashboard-kpi-heading"
    >
      <div className="text-center">
        <h2
          id="dashboard-kpi-heading"
          className="text-2xl font-bold tracking-tight text-white sm:text-[32px]"
        >
          Ce à quoi vous avez droit, dès le premier jour.
        </h2>
      </div>

      <ul className="mx-auto mt-8 flex max-w-3xl flex-col gap-4 sm:mt-10 sm:gap-5">
        {INCLUSIONS.map((item) => (
          <InclusionCard
            key={item.image}
            image={item.image}
            imageAlt={item.imageAlt}
            title={item.title}
            body={item.body}
          />
        ))}
      </ul>

      <div className="mx-auto mt-8 max-w-4xl sm:mt-10">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="text-left">
              <p className="text-xs font-medium text-slate-500">Mon espace MedSim</p>
              <p className="text-base font-bold text-[#1D4D3A] sm:text-lg">
                Bonjour, {greetingName}
              </p>
            </div>
            <span className="rounded-full bg-[#F0F7F4] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1D4D3A] sm:text-[11px]">
              Aperçu illustratif
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-6">
            {DEMO_KPIS.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-slate-100 bg-[#FAFAF8] p-3 text-left sm:p-4"
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-[11px]">
                    {kpi.label}
                  </p>
                  <TrendBadge trend={kpi.trend} />
                </div>
                <p className="mt-1 text-xl font-bold tabular-nums text-[#1A1A2E] sm:text-2xl">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-500 sm:text-xs">
                  {kpi.hint}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700">Évolution du poids</p>
                <p className="text-[10px] text-slate-500">12 dernières semaines (livres)</p>
              </div>
              <p className="text-sm font-bold text-emerald-600">−25,4 lb</p>
            </div>
            <div className="mt-4 h-28 w-full sm:h-32">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden
              >
                <defs>
                  <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3EBD93" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3EBD93" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${chartPath} L 100 100 L 0 100 Z`}
                  fill="url(#weight-fill)"
                />
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#1D4D3A"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-slate-400 sm:text-[10px]">
              <span>Sem. 1</span>
              <span>Sem. 6</span>
              <span>Sem. 12</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-white/60 sm:text-xs">
          Données fictives à titre illustratif — votre tableau de bord reflètera vos mesures réelles.
        </p>
      </div>
    </section>
  );
}
