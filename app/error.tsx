"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  console.error("[GlobalError]", error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
      <p className="max-w-md text-base font-semibold text-slate-900">
        Une erreur empêche l&apos;affichage de la page.
      </p>
      <p className="max-w-lg text-sm text-slate-600">
        Réessayez dans quelques instants. Si le problème persiste, contactez le support MedSim.
      </p>
      <button
        type="button"
        className="rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#188763]"
        onClick={() => reset()}
      >
        Réessayer
      </button>
    </div>
  );
}
