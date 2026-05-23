"use client";

import { GLP1_BENEFITS } from "@/lib/patient/glp1-content";
import { Glp1EvaluationEntryCta } from "@/components/onboarding/Glp1EvaluationEntryCta";

export function GestionPoidsStartSection() {
  return (
    <section
      id="commencer"
      className="border-t border-slate-200/60 bg-white py-14 sm:py-16"
      aria-labelledby="glp-start-title"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <h2
          id="glp-start-title"
          className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Commencer mon parcours GLP-1
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          Parcourez librement cette page. Pour démarrer l&apos;évaluation, connectez-vous à votre
          compte patient — vous accéderez ensuite au questionnaire et à votre espace de suivi.
        </p>

        <ul className="mt-8 space-y-4">
          {GLP1_BENEFITS.map((b) => (
            <li
              key={b.title}
              className="rounded-xl border border-[#C8E6D9]/60 bg-[#F0FBF7] px-5 py-4"
            >
              <p className="font-semibold text-slate-900">{b.title}</p>
              <p className="mt-1 text-sm text-slate-600">{b.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Glp1EvaluationEntryCta
            className="mx-auto block w-full max-w-md rounded-xl bg-[#1D9E75] px-8 py-4 text-center text-base font-semibold text-white shadow-lg transition hover:bg-[#178f6a] sm:text-lg"
          />
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-[11px] leading-relaxed text-slate-400">
          Les informations fournies ne constituent pas un avis médical. Toute prescription est soumise à
          l&apos;évaluation d&apos;un professionnel de santé autorisé.
        </p>
      </div>
    </section>
  );
}
