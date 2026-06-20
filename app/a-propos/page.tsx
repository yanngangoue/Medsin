import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "À propos de nous — Anne-sante",
  description:
    "Anne-sante : plateforme québécoise de santé métabolique en ligne, encadrée par des professionnels certifiés.",
};

export default function AProposPage() {
  return (
    <LegalPageLayout title="À propos de nous">
      <p>
        Anne-sante est une plateforme québécoise de santé métabolique 100 % en ligne. Nous accompagnons les
        personnes éligibles dans leur parcours de gestion du poids, avec des traitements personnalisés,
        un suivi proactif et un tableau de bord dédié.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Notre approche</h2>
      <p>
        Chaque parcours est encadré par des professionnels de santé licenciés au Québec. Les prescriptions
        et les suivis respectent les bonnes pratiques cliniques ; la plateforme vise la conformité aux
        exigences québécoises en matière de protection des renseignements personnels et de télésanté.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Ce que nous offrons</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Évaluation d&apos;éligibilité en ligne</li>
        <li>Traitement personnalisé et livraison des médicaments</li>
        <li>Suivi hebdomadaire et accès à votre espace patient</li>
        <li>Support par messagerie pour vos questions</li>
      </ul>
      <p className="pt-4">
        Des questions ? Consultez notre page{" "}
        <Link href="/contact" className="text-[var(--teal-900)] underline">
          Contact
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
