"use client";

import { GLP1_BENEFITS } from "@/lib/patient/glp1-content";

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5 8l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GestionPoidsCommencerSection() {
  return (
    <section
      id="commencer"
      className="border-t border-[#E8E0D8]/80 bg-[#F5F0EB] px-4 py-10 sm:px-8 sm:py-14"
      aria-labelledby="glp-commencer-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1D9E75]">
              Étape 1 · Environ 5 minutes
            </p>
            <h2
              id="glp-commencer-title"
              className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              Vérifiez votre admissibilité GLP-1
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Un court questionnaire médical, comme pour un programme de perte de poids encadré. Vos
              réponses sont revues par un professionnel avant toute prescription.
            </p>
          </div>

          <ul className="space-y-3">
            {GLP1_BENEFITS.map((b) => (
              <li
                key={b.title}
                className="flex gap-3 rounded-xl border border-[#C8E6D9]/50 bg-white/80 px-4 py-3.5 shadow-sm"
              >
                <CheckIcon />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400 lg:mt-10">
          Les informations fournies ne constituent pas un avis médical. Toute prescription est soumise
          à l&apos;évaluation d&apos;un professionnel de santé autorisé au Québec.
        </p>
      </div>
    </section>
  );
}
