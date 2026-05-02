import Image from "next/image";

type WellbeingPolicyCardProps = {
  className?: string;
  /** Liens du footer légal (URLs réelles ou ancres). */
  termsHref?: string;
  privacyHref?: string;
};

/**
 * Carte bien-être avec bloc politique / disclaimers (style apaisant type wellness apps).
 */
export function WellbeingPolicyCard({
  className = "",
  termsHref = "#conditions-utilisation",
  privacyHref = "#politique-confidentialite",
}: WellbeingPolicyCardProps) {
  return (
    <article
      className={`mx-auto w-full max-w-[480px] overflow-hidden rounded-xl border-[0.5px] border-neutral-200/90 bg-white shadow-sm shadow-neutral-900/[0.04] ${className}`}
    >
      <div className="bg-[#faf9f7] px-5 pb-5 pt-5">
        <h2 className="text-[17px] font-bold leading-snug tracking-tight text-neutral-900">
          Bien-être et sérénité
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
          Prenez un moment pour vous : détente, lumière naturelle et calme — le bon équilibre entre
          objectifs de santé et douceur au quotidien.
        </p>

        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#f3eee8] ring-1 ring-black/[0.04]">
          <Image
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=960&q=80"
            alt="Ambiance bien-être : serviette, bougie et fleurs"
            fill
            className="object-cover"
            sizes="480px"
            priority={false}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fce8ec] text-[15px] font-semibold text-[#9d4d63]"
            aria-hidden
          >
            N
          </span>
          <p className="text-[12px] leading-snug text-neutral-500">
            Version démo · Aucune ordonnance réelle générée
          </p>
        </div>
      </div>

      <footer className="border-t border-neutral-200/90 bg-[#f8f6f4] px-5 py-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Ce que nous sommes
        </h3>
        <p className="mt-3 text-[12px] leading-relaxed text-neutral-600">
          Nous sommes un outil d&apos;accompagnement au bien-être personnel. Nous ne remplaçons pas un
          professionnel de santé et ne fournissons pas de diagnostics médicaux.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-neutral-600">
          Nos suggestions sont à titre informatif seulement et ne constituent pas un avis médical.
          Pour toute question de santé, consultez un médecin ou un professionnel qualifié.
        </p>
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
          Vos données restent confidentielles et ne sont pas partagées avec des tiers. En utilisant ce
          service, vous acceptez nos{" "}
          <a href={termsHref} className="underline decoration-neutral-400 underline-offset-2 hover:text-neutral-600">
            conditions d&apos;utilisation
          </a>{" "}
          et notre{" "}
          <a
            href={privacyHref}
            className="underline decoration-neutral-400 underline-offset-2 hover:text-neutral-600"
          >
            politique de confidentialité
          </a>
          .
        </p>
      </footer>
    </article>
  );
}
