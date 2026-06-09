"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function OnboardingError({ error, reset }: Props) {
  console.error("[OnboardingError]", error);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white p-8 text-center">
      <p className="text-base font-semibold text-slate-900">Le parcours d&apos;inscription a rencontré une erreur.</p>
      <p className="max-w-md text-sm text-slate-600">
        Réessayez ou revenez à l&apos;accueil si le problème persiste.
      </p>
      <button
        type="button"
        className="rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#178f6a]"
        onClick={() => reset()}
      >
        Réessayer
      </button>
    </div>
  );
}
