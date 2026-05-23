import { NUTRI_PLUS_BENEFITS } from "@/lib/patient/nutri-plus-content";

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

export function NutriPlusBenefits() {
  return (
    <section
      id="benefices"
      className="border-t border-[#E8E0D8]/80 bg-white px-4 py-12 sm:px-8 sm:py-14"
      aria-labelledby="nutri-benefits-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="nutri-benefits-title"
            className="text-lg font-bold uppercase tracking-wide text-slate-900 sm:text-xl"
          >
            Une approche structurée, sans jargon
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Nutri+ met en avant vos compléments en gélules et en poudre, avec une orientation validée
            dans votre espace MedSim.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {NUTRI_PLUS_BENEFITS.map((b) => (
            <li
              key={b.title}
              className="flex gap-3 rounded-xl border border-[#C8E6D9]/40 bg-[#F5F0EB]/60 px-4 py-4 shadow-sm"
            >
              <CheckIcon />
              <div>
                <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{b.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
