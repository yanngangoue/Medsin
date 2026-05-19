import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Garantie — MedSim",
  description: "Politique de garantie et satisfaction MedSim.",
};

export default function GarantiePage() {
  return (
    <LegalPageLayout title="Garantie">
      <p>
        MedSim s&apos;engage à offrir un accompagnement de qualité encadré par des professionnels de
        santé licenciés au Canada.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Satisfaction</h2>
      <p>
        Si, après 30 jours de suivi conforme au plan établi avec votre équipe, vous ne constatez aucune
        évolution mesurable sur les indicateurs convenus, vous pouvez demander un examen de votre dossier
        pour évaluer un remboursement partiel ou un ajustement du parcours, selon les conditions en vigueur
        au moment de votre inscription.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Repas santé</h2>
      <p>
        Pour les commandes de boîtes repas préparées par nos restaurants partenaires, toute réclamation
        concernant la qualité ou la conformité de la commande doit être signalée dans les 48 heures suivant
        la livraison via notre page{" "}
        <Link href="/contact" className="text-[var(--teal-900)] underline">
          Contact
        </Link>
        .
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Exclusions</h2>
      <p>
        La garantie ne s&apos;applique pas en cas de non-respect des recommandations médicales ou
        nutritionnelles, d&apos;informations incomplètes fournies au dossier, ou de situations d&apos;urgence
        nécessitant une consultation en personne.
      </p>
      <p className="pt-4 text-xs text-slate-500">
        Version indicative — démo produit. Les modalités définitives seront précisées dans votre contrat de
        service.
      </p>
    </LegalPageLayout>
  );
}
