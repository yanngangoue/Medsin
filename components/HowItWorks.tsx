import { LandingSectionImage } from "@/components/LandingSectionImage";

const CONSULTATION_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=90";

function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="#0D9488" strokeWidth="2" />
      <path
        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        stroke="#0D9488"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconStethoscope() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4v6a6 6 0 0 0 12 0V4M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M9 20h6"
        stroke="#0D9488"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="14" r="2" stroke="#0D9488" strokeWidth="2" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 8v8l-9 4-9-4V8l9-4 9 4Z"
        stroke="#0D9488"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m3 8 9 4 9-4M12 12v9" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Remplissez le questionnaire",
    desc: "Quelques questions sur votre santé.",
    Icon: IconClipboard,
  },
  {
    n: 2,
    title: "Un médecin examine votre dossier",
    desc: "Un médecin valide votre dossier.",
    Icon: IconStethoscope,
  },
  {
    n: 3,
    title: "Recevez votre ordonnance",
    desc: "Vous recevez la suite des étapes à suivre.",
    Icon: IconPackage,
  },
] as const;

export function HowItWorks() {
  return (
    <div className="mt-16 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm shadow-slate-200/40 backdrop-blur-[2px]">
      <h2 className="text-base font-semibold text-slate-900">Comment ça marche</h2>
      <p className="mt-2 text-sm leading-snug text-slate-600">
        Consultation en ligne en tout sécurité : vous échangez avec votre équipe médicale où que vous soyez.
      </p>
      <LandingSectionImage
        src={CONSULTATION_IMAGE}
        alt="Personne en téléconsultation sur ordinateur portable dans un cadre médical lumineux"
        aspect="video"
        className="mt-6"
      />
      <div className="mt-6 flex gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        {STEPS.map(({ n, title, desc, Icon }) => (
          <div key={n} className="min-w-[240px] shrink-0 sm:min-w-0">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
                {n}
              </span>
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  <Icon />
                  <h3 className="text-sm font-semibold leading-snug text-slate-900">{title}</h3>
                </div>
                <p className="mt-2 text-sm leading-snug text-slate-600">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
