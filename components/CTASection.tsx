import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-[var(--teal-400)] py-14 text-white sm:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-[28px] font-bold tracking-tight sm:text-[32px]">
          Prêt à commencer votre transformation ?
        </h2>
        <p className="mt-3 text-[16px] text-white/90 sm:text-[17px]">
          Évaluation gratuite · Résultat en 24 h · Annulation possible
        </p>
        <Link
          href="/eligibilite"
          aria-label="Commencer mon évaluation médicale"
          className="mt-8 inline-flex h-[52px] items-center justify-center rounded-[8px] bg-white px-8 text-[15px] font-semibold text-[var(--teal-600)] shadow-sm transition hover:opacity-95 hover:[transform:scale(1.02)] active:scale-[0.99]"
        >
          Commencer mon évaluation →
        </Link>
        <p className="mt-5 text-[13px] text-white/85">
          Garantie remboursement si aucun résultat après 30 jours
        </p>
      </div>
    </section>
  );
}
