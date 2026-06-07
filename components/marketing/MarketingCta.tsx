import Link from "next/link";

export function MarketingCta() {
  return (
    <section className="bg-[#1D4D3A] py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
        <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
          Commencez aujourd&apos;hui.
          <br />
          Anne vous attend.
        </h2>
        <p className="mt-6 text-lg text-white/70">
          Éligibilité en 2 min · Ordonnance sous 48 h · Livraison discrète
        </p>
        <Link
          href="/eligibilite"
          className="mt-10 inline-flex rounded-full bg-white px-10 py-4 text-base font-semibold text-[#1D4D3A] shadow-sm transition-opacity hover:opacity-90"
        >
          Suis-je éligible ? →
        </Link>
        <p className="mt-6 text-sm text-white/50">
          Aucune carte de crédit requise pour l&apos;évaluation
        </p>
      </div>
    </section>
  );
}
