"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminPortalError({ reset }: Props) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-base font-semibold text-slate-900">
        L&apos;espace d&apos;administration est temporairement indisponible.
      </p>
      <p className="max-w-md text-sm text-slate-600">
        Une erreur inattendue s&apos;est produite. Réessayez ou rechargez la page.
      </p>
      <button
        type="button"
        className="rounded-xl bg-[#1D4D3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163d2e]"
        onClick={() => reset()}
      >
        Réessayer
      </button>
    </div>
  );
}
