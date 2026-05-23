import { NUTRI_PLUS_HOW, NUTRI_PLUS_HOW_STEPS } from "@/lib/patient/nutri-plus-content";

const ICON_COLOR = "#1D4D3A";

function IconConfigure() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <rect x="8" y="12" width="32" height="40" rx="4" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M18 24h12M18 34h12M18 44h8" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="56" cy="36" r="14" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M50 36l4 4 8-8" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconJournal() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <rect x="12" y="8" width="36" height="52" rx="4" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M22 22h20M22 32h16M22 42h12" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M54 20h12v32H54" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconComplements() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <ellipse cx="40" cy="52" rx="24" ry="6" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M20 52c0-14 8-26 20-26s20 12 20 26" stroke={ICON_COLOR} strokeWidth="1.75" />
      <circle cx="32" cy="28" r="6" stroke={ICON_COLOR} strokeWidth="1.5" />
      <circle cx="48" cy="24" r="5" stroke={ICON_COLOR} strokeWidth="1.5" />
    </svg>
  );
}

const STEP_ICONS = [IconConfigure, IconJournal, IconComplements] as const;

export function NutriPlusHowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="border-t border-stone-200/50 bg-white py-12 sm:py-14"
      aria-labelledby="nutri-how-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="nutri-how-title"
            className="text-lg font-bold uppercase leading-snug tracking-wide text-[#1A2E24] sm:text-xl"
          >
            {NUTRI_PLUS_HOW.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#3D5C4A] sm:text-[15px]">{NUTRI_PLUS_HOW.lead}</p>
        </div>
        <div className="mt-10 grid gap-10 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {NUTRI_PLUS_HOW_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? IconComplements;
            return (
              <article key={step.title} className="flex flex-col items-center text-center">
                <div className="flex h-20 items-center justify-center">
                  <Icon />
                </div>
                <h3 className="mt-4 text-sm font-bold uppercase leading-snug tracking-wide text-[#1A2E24] sm:text-[13px]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#3D5C4A]">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
