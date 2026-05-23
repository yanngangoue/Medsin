import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Conditions d'utilisation — MedSim",
  description: "Conditions générales d'utilisation de la plateforme MedSim.",
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPageLayout title="Conditions d'utilisation">
      <p>
        En accédant à MedSim, vous acceptez les présentes conditions. Si vous n&apos;acceptez pas ces
        termes, n&apos;utilisez pas la plateforme.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Services</h2>
      <p>
        MedSim propose des parcours de santé métabolique (gestion du poids, Nutri+, catalogue compléments)
        encadrés par des professionnels et, le cas échéant, des partenaires tiers (fournisseurs nutrition).
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Compte utilisateur</h2>
      <p>
        Vous êtes responsable de la confidentialité de vos identifiants et de l&apos;exactitude des
        informations fournies. Toute activité sous votre compte vous est imputable.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Limitation de responsabilité</h2>
      <p>
        MedSim ne garantit pas de résultats spécifiques. Les contenus sont fournis à titre informatif et
        ne constituent pas un avis médical en l&apos;absence d&apos;évaluation par un professionnel.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Propriété intellectuelle</h2>
      <p>
        Les marques, textes et éléments visuels de MedSim sont protégés. Toute reproduction non autorisée
        est interdite.
      </p>
      <p className="pt-4">
        Pour toute question :{" "}
        <Link href="/contact" className="text-[var(--teal-900)] underline">
          Contact
        </Link>
        {" · "}
        <Link href="/politique-confidentialite" className="text-[var(--teal-900)] underline">
          Politique de confidentialité
        </Link>
      </p>
    </LegalPageLayout>
  );
}
