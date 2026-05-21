"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Est-ce que j'ai besoin d'une assurance ?",
    a: "Non. Medsim est accessible sans assurance privée obligatoire. Votre parcours inclut le suivi médical, la livraison discrète et l'accompagnement essentiel.",
  },
  {
    q: "Combien de temps avant de voir des résultats ?",
    a: "La plupart des patients constatent une réduction de l'appétit dès la première semaine. Les résultats visibles sur le poids apparaissent généralement après 4 semaines.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans frais d'annulation ni engagement minimum. Vous pouvez arrêter ou mettre en pause depuis votre portail.",
  },
  {
    q: "Les médicaments sont-ils approuvés ?",
    a: "Les médicaments de marque (Ozempic, Wegovy) sont approuvés par Santé Canada. Les versions composées sont préparées par des pharmacies licenciées selon des standards rigoureux.",
  },
  {
    q: "Comment fonctionne la consultation médicale ?",
    a: "Vous remplissez un questionnaire détaillé en ligne. Un médecin licencié au Canada examine votre dossier et vous contacte si nécessaire avant d'émettre une ordonnance.",
  },
  {
    q: "Est-ce que ça convient à tout le monde ?",
    a: "Non. Le GLP-1 n'est pas approprié pour les femmes enceintes, les personnes avec certains antécédents médicaux, ou un IMC insuffisant. L'évaluation médicale détermine votre éligibilité.",
  },
] as const;

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-[var(--teal-50)] py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
          Questions fréquentes
        </h2>

        <div className="mt-10 space-y-2">
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div
                key={q}
                className="overflow-hidden rounded-[12px] border border-neutral-200/90 bg-white shadow-sm"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-[var(--gray-900)] transition hover:bg-neutral-50"
                >
                  {q}
                  <span className="shrink-0 text-[var(--teal-400)]" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className="border-t border-neutral-100 px-5 pb-4 pt-2 text-[14px] leading-relaxed text-neutral-600"
                  >
                    {a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
