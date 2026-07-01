import Link from "next/link";

const CARD_BASE =
  "flex flex-col rounded-[12px] bg-white p-6 shadow-sm transition hover:[transform:scale(1.02)]";

export function MedicationCards() {
  return (
    <section id="medicaments" className="scroll-mt-24 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            Choisissez votre traitement
          </h2>
          <p className="mt-3 text-[16px] text-neutral-600 sm:text-[17px]">
            Prescrit uniquement après évaluation médicale
          </p>
        </div>

        <div id="tarifs" className="mt-12 scroll-mt-24 grid gap-6 lg:grid-cols-3">
          {/* Carte 1 */}
          <article className={`${CARD_BASE} border border-neutral-200`}>
            <span className="w-fit rounded-[24px] bg-[var(--teal-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--teal-600)]">
              Le plus populaire
            </span>
            <h3 className="mt-4 text-[18px] font-bold text-[var(--gray-900)]">
              Sémaglutide Injection
            </h3>
            <p className="mt-2 text-[22px] font-bold text-[var(--teal-400)]">À partir de 179$/mois</p>
            <ul className="mt-5 flex flex-col gap-2 text-[14px] text-neutral-700">
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Injection hebdomadaire
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Médecin inclus
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Livraison incluse
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Assistance 24 h/24
              </li>
            </ul>
            <Link
              href="/eligibilite"
              aria-label="Commencer avec Sémaglutide injection"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] border border-neutral-300 bg-white text-[14px] font-semibold text-[var(--gray-900)] shadow-sm transition hover:bg-neutral-50"
            >
              Commencer →
            </Link>
          </article>

          {/* Carte 2 — mise en avant */}
          <article
            className={`${CARD_BASE} border-2 border-[var(--teal-400)] ring-1 ring-[var(--teal-400)]/20`}
          >
            <span className="w-fit rounded-[24px] bg-[var(--teal-400)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              ⭐ Recommandé
            </span>
            <h3 className="mt-4 text-[18px] font-bold text-[var(--gray-900)]">
              Sémaglutide Comprimé
            </h3>
            <p className="mt-2 text-[22px] font-bold text-[var(--teal-400)]">À partir de 249$/mois</p>
            <ul className="mt-5 flex flex-col gap-2 text-[14px] text-neutral-700">
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Comprimé quotidien (sans aiguille)
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Plan semaine par semaine inclus
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Portail patient complet
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Assistance 24 h/24
              </li>
            </ul>
            <Link
              href="/eligibilite"
              aria-label="Commencer avec Sémaglutide comprimé"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--teal-400)] text-[14px] font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Commencer →
            </Link>
          </article>

          {/* Carte 3 */}
          <article className={`${CARD_BASE} border border-neutral-200`}>
            <h3 className="mt-2 text-[18px] font-bold text-[var(--gray-900)]">
              Tirzépatide (Mounjaro)
            </h3>
            <p className="mt-2 text-[22px] font-bold text-[var(--teal-400)]">Sur devis médical</p>
            <ul className="mt-5 flex flex-col gap-2 text-[14px] text-neutral-700">
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Double action GLP-1 + GIP
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Résultats jusqu&apos;à 20% poids perdu
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal-400)]">✓</span> Disponibilité selon prescription
              </li>
            </ul>
            <Link
              href="/eligibilite"
              aria-label="Vérifier mon éligibilité au Tirzépatide"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] border border-neutral-300 bg-white text-[14px] font-semibold text-[var(--gray-900)] shadow-sm transition hover:bg-neutral-50"
            >
              Vérifier mon éligibilité →
            </Link>
          </article>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[12px] leading-relaxed text-neutral-500">
          * Prix en dollars canadiens. Aucune assurance requise. Annulation possible en tout temps.
        </p>
      </div>
    </section>
  );
}
