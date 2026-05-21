import Link from "next/link";
import { glp1PatientServiceHref } from "@/lib/patient/glp1-flow-routes";
import { PATIENT_SERVICE_CARDS } from "@/lib/patient/services";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

const ICONS: Record<string, string> = {
  "gestion-poids": "⚖️",
  "nutri-plus": "🥗",
  "repas-sante": "🍽️",
};

type Props = {
  highlightGlp1?: boolean;
  hasGlp1Dossier?: boolean;
};

export function PatientSpaceServices({ highlightGlp1 = true, hasGlp1Dossier = false }: Props) {
  return (
    <section aria-labelledby="services-title">
      <h2 id="services-title" className="text-lg font-bold text-slate-900 sm:text-xl">
        Autres services MedSim
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Complétez votre accompagnement au-delà du dossier GLP-1.
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {PATIENT_SERVICE_CARDS.map((card) => {
          const isGlp1 = card.id === "gestion-poids";
          const href = isGlp1
            ? glp1PatientServiceHref(hasGlp1Dossier)
            : card.href.startsWith("#")
              ? `${PUBLIC_CATALOG_HOME}${card.href}`
              : card.href;
          return (
            <li key={card.id}>
              <Link
                href={href}
                className={`flex h-full flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
                  highlightGlp1 && isGlp1
                    ? "border-[#1D9E75]/30 bg-[#F0FBF7] ring-1 ring-[#1D9E75]/20"
                    : "border-slate-200/90 bg-white shadow-sm hover:border-[#1D9E75]/30"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {ICONS[card.id] ?? "•"}
                </span>
                <span className="mt-3 text-base font-bold text-slate-900">{card.title}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {card.subtitle}
                </span>
                <span className="mt-4 text-sm font-semibold text-[#1D9E75]">
                  {isGlp1 && hasGlp1Dossier ? "Voir mon dossier →" : "Explorer →"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
