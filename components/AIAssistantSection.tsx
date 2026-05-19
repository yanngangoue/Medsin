/** Illustration schématique : visualisation de données → professionnel de santé (décoratif). */
function DataToDoctorIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="ai-dash-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0faf6" />
          <stop offset="100%" stopColor="#d1f5e8" />
        </linearGradient>
        <linearGradient id="ai-spark" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a9e7a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1a9e7a" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Tableau de bord */}
      <rect x="12" y="36" width="158" height="168" rx="14" fill="url(#ai-dash-grad)" stroke="#c8e6d9" strokeWidth="1.5" />
      <rect x="32" y="56" width="52" height="7" rx="3" fill="#94a3b8" opacity="0.35" />
      <rect x="32" y="70" width="118" height="5" rx="2" fill="#94a3b8" opacity="0.2" />
      <path
        d="M36 138 L56 112 L78 124 L98 92 L118 104 L138 82 L154 94"
        stroke="url(#ai-spark)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="32" y="158" width="34" height="34" rx="8" fill="#1a9e7a" opacity="0.1" />
      <rect x="74" y="158" width="34" height="26" rx="8" fill="#1a9e7a" opacity="0.15" />
      <rect x="116" y="158" width="34" height="40" rx="8" fill="#1a9e7a" opacity="0.2" />

      {/* Flux ↔ */}
      <line x1="182" y1="118" x2="218" y2="118" stroke="#1a9e7a" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <polygon points="214,114 224,118 214,122" fill="#1a9e7a" opacity="0.55" />
      <line x1="218" y1="132" x2="182" y2="132" stroke="#1a9e7a" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <polygon points="186,128 176,132 186,136" fill="#1a9e7a" opacity="0.4" />

      {/* Clinicien (schéma) */}
      <rect x="236" y="36" width="152" height="168" rx="14" fill="#fafdfb" stroke="#d1f5e8" strokeWidth="1.5" />
      <circle cx="312" cy="92" r="26" fill="#e8f5f0" stroke="#1a9e7a" strokeWidth="1.2" opacity="0.55" />
      <path d="M300 100c4-6 14-6 22 0" stroke="#0f6e56" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M276 128h72v52c-10 10-26 14-36 14s-26-4-36-14v-52Z" fill="#ffffff" stroke="#d1f5e8" strokeWidth="1.2" />
      <path
        d="M328 96c14 2 24 14 24 28v10M328 96c-6 10-6 22 0 32"
        stroke="#1a9e7a"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="352" cy="88" r="5" fill="#1a9e7a" opacity="0.2" />
    </svg>
  );
}

function IconAnalyze({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5M7 19v-4M11 19V9M15 19v-7M19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconRecommend({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l7 4v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V7l7-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSupervision({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 4v6a6 6 0 0 0 12 0V4M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="14" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const BLOCKS = [
  {
    title: "Analyse continue",
    text: "Interprétation des données santé issues de vos questionnaires et suivis, pour repérer les variations métaboliques pertinentes.",
    Icon: IconAnalyze,
  },
  {
    title: "Recommandations personnalisées",
    text: "Suggestions ciblées sur la nutrition et les habitudes de vie, cohérentes avec votre profil — jamais à la place d’un avis médical.",
    Icon: IconRecommend,
  },
  {
    title: "Supervision médicale",
    text: "Les médecins examinent les éléments mis en évidence et valident chaque étape thérapeutique. La décision finale reste humaine.",
    Icon: IconSupervision,
  },
] as const;

export function AIAssistantSection() {
  return (
    <section className="border-t border-[var(--border-soft)] bg-white py-14 sm:py-20" aria-labelledby="ai-assistant-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div className="min-w-0">
            <h2 id="ai-assistant-heading" className="text-[26px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
              Une intelligence artificielle au service du suivi médical
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--gray-muted)] sm:text-[16px]">
              Notre IA analyse vos réponses, détecte les variations métaboliques et aide les professionnels à ajuster votre
              parcours. Les décisions thérapeutiques restent toujours humaines.
            </p>

            <ul className="mt-10 space-y-4">
              {BLOCKS.map(({ title, text, Icon }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-[14px] border border-[var(--border-soft)] bg-[var(--teal-light)]/50 p-4 shadow-sm sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[var(--teal)] shadow-sm ring-1 ring-[var(--teal-mid)]/40">
                    <Icon />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-[var(--gray-900)]">{title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-600 sm:text-[14px]">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-[16px] border border-[var(--teal-mid)]/50 bg-gradient-to-br from-[var(--teal-light)] to-white p-6 shadow-sm sm:p-8">
              <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--gray-muted)]">
                Données patient → validation clinique
              </p>
              <DataToDoctorIllustration className="h-auto w-full max-h-[220px] text-inherit sm:max-h-[260px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
