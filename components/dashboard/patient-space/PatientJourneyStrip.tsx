import type { PatientJourneyStep } from "@/lib/patient/patient-space";

type Props = {
  steps: PatientJourneyStep[];
};

export function PatientJourneyStrip({ steps }: Props) {
  return (
    <nav
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Étapes de votre parcours"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Votre parcours
      </p>
      <ol className="grid grid-cols-4 gap-2 sm:gap-3">
        {steps.map((step, i) => (
          <li key={step.id} className="flex flex-col items-center text-center">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition sm:h-10 sm:w-10 ${
                step.state === "done"
                  ? "bg-[#1D9E75] text-white shadow-sm"
                  : step.state === "current"
                    ? "border-2 border-[#1D9E75] bg-white text-[#1D9E75] shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {step.state === "done" ? "✓" : i + 1}
            </span>
            <span
              className={`mt-2 line-clamp-2 text-[10px] font-semibold leading-tight sm:text-[11px] ${
                step.state === "current"
                  ? "text-slate-900"
                  : step.state === "done"
                    ? "text-[#1D9E75]"
                    : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
