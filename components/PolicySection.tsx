export function PolicySection() {
  return (
    <section className="border-t border-[var(--border-soft)] bg-white py-6">
      <div className="mx-auto max-w-[860px] px-6 text-[var(--gray-900)]">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 sm:text-xs">
          CE QUE NOUS SOMMES
        </h2>

        <p className="mt-5 text-[14px] leading-relaxed text-neutral-700">
          MedSim est une plateforme de télémédecine connectant les patients à des médecins licenciés au Canada.
          Nous ne remplaçons pas une consultation en personne et ne fournissons aucun diagnostic. Les ordonnances
          sont émises uniquement par des professionnels de santé qualifiés, après évaluation médicale complète.
        </p>

        <p className="mt-4 text-[14px] leading-relaxed text-neutral-700">
          Les traitements GLP-1 (Ozempic, Wegovy, Mounjaro) sont prescrits uniquement si le profil médical du
          patient le justifie. Les médicaments composés sont préparés dans des pharmacies autorisées. Résultats
          variables selon les individus.
        </p>

        <p className="mt-5 text-[10px] leading-relaxed text-neutral-400">
          Vos données médicales sont protégées conformément à la Loi 25. En utilisant MedSim, vous acceptez nos{" "}
          <a href="/conditions-utilisation" className="underline underline-offset-2 hover:text-neutral-600">
            conditions d&apos;utilisation
          </a>{" "}
          et notre{" "}
          <a href="/confidentialite" className="underline underline-offset-2 hover:text-neutral-600">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </section>
  );
}
