import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Conditions d'utilisation — Anne Santé",
  description: "Conditions générales d'utilisation de la plateforme Anne Santé.",
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPageLayout title="Conditions d'utilisation">
      <p>
        En accédant à Anne Santé, vous acceptez les présentes conditions. Si vous n&apos;acceptez pas ces
        termes, n&apos;utilisez pas la plateforme.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Services</h2>
      <p>
        Anne Santé propose un parcours de gestion du poids (GLP-1) encadré par des professionnels de santé,
        complété par un assistant IA proactif pour le suivi au quotidien.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Compte utilisateur</h2>
      <p>
        Vous êtes responsable de la confidentialité de vos identifiants et de l&apos;exactitude des
        informations fournies. Toute activité sous votre compte vous est imputable.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Limitation de responsabilité</h2>
      <p>
        Anne Santé ne garantit pas de résultats spécifiques. Les contenus sont fournis à titre informatif et
        ne constituent pas un avis médical en l&apos;absence d&apos;évaluation par un professionnel.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Propriété intellectuelle</h2>
      <p>
        Les marques, textes et éléments visuels de Anne Santé sont protégés. Toute reproduction non autorisée
        est interdite.
      </p>
      <p className="pt-4">
        Pour toute question :{" "}
        <Link href="/contact" className="text-[var(--teal-900)] underline">
          Contact
        </Link>
        {" · "}
        <Link href="/confidentialite" className="text-[var(--teal-900)] underline">
          Politique de confidentialité
        </Link>
      </p>
    </LegalPageLayout>
  );
}
