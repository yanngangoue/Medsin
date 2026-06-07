import { HOW_IT_WORKS_STEPS } from "@/lib/marketing/landing-content";

export function MarketingHowItWorks() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Simple. Médical. Efficace.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li
              key={step.number}
              className="relative flex flex-col rounded-2xl border border-gray-100 bg-[#FAFAF8] p-6 shadow-sm"
            >
              {step.exclusive ? (
                <span className="absolute -top-3 right-4 rounded-full bg-[#3EBD93] px-3 py-1 text-xs font-bold text-white shadow-sm">
                  Exclusif MedSim
                </span>
              ) : null}

              <div className="flex items-center gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] text-sm font-bold text-white"
                  aria-hidden
                >
                  {step.number}
                </span>
                <span className="text-2xl" aria-hidden>
                  {step.icon}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#1A1A2E]">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1A1A2E]/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
