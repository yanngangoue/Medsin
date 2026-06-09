const DETAILS = [
  {
    num: "01",
    title: "Onboarding en ligne",
    badge: "5 min",
    intro: "Un questionnaire structuré, conçu par des médecins.",
    points: [
      "Antécédents médicaux et allergies",
      "Médicaments actuels",
      "Poids, taille, IMC",
      "Objectifs et mode de vie",
    ],
  },
  {
    num: "02",
    title: "Révision médicale",
    badge: "Sous 24 h",
    intro: "Un professionnel licencié au Canada examine votre dossier.",
    points: [
      "Médecins certifiés au Canada",
      "Évaluation strictement médicale",
      "Contact si information manquante",
      "Décision transparente et motivée",
    ],
  },
  {
    num: "03",
    title: "Prescription",
    badge: "Si éligible",
    intro: "Ordonnance réelle si votre profil est compatible.",
    points: [
      "Sémaglutide ou Tirzépatide",
      "Dosage personnalisé par le médecin",
      "Plan de titration semaine par semaine",
      "Instructions claires incluses",
    ],
  },
  {
    num: "04",
    title: "Livraison + suivi",
    badge: "48 h",
    intro: "Livraison discrète. Suivi via portail sécurisé.",
    points: [
      "Livraison discrète, kit complet",
      "Portail patient avec historique",
      "Ajustement de dose si nécessaire",
      "Assistance médicale 24 h/24 par messagerie",
    ],
  },
] as const;

export function StepsDetail() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[34px]">
            Ce que chaque étape comprend
          </h2>
          <p className="mt-3 text-[16px] text-[var(--gray-muted)] sm:text-[17px]">
            Transparent, encadré, sans surprise
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {DETAILS.map((block) => (
            <article
              key={block.num}
              className="flex gap-4 rounded-[14px] border border-[var(--border-soft)] p-6 shadow-sm transition hover:[transform:scale(1.02)]"
            >
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--teal-light)] text-[18px] font-black text-[var(--teal)]">
                {block.num}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                  <h3 className="text-[17px] font-bold text-[var(--gray-900)]">{block.title}</h3>
                  <span className="rounded-[20px] bg-[var(--teal-mid)] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--teal)]">
                    {block.badge}
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-snug text-[var(--gray-muted)]">{block.intro}</p>
                <ul className="mt-4 space-y-2">
                  {block.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-[14px] leading-snug text-neutral-800">
                      <span className="shrink-0 font-bold text-[var(--teal)]">→</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
