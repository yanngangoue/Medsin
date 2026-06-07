import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Conformité & Loi 25 — MedSim",
  description: "Conformité MedSim : Loi 25, santé et protection des renseignements.",
};

export default function ConformitePage() {
  return (
    <LegalPageLayout title="Conformité & Loi 25">
      <p>
        MedSim déploie ses services dans un cadre visant la conformité aux exigences québécoises et
        canadiennes en matière de protection des renseignements personnels et de télésanté.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Loi 25 (Québec)</h2>
      <p>
        Nous appliquons les principes de minimisation, de limitation des finalités et de transparence.
        Un registre des incidents et des traitements est tenu ; les personnes concernées sont informées
        en cas d&apos;incident présentant un risque sérieux, conformément à la réglementation.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Renseignements de santé</h2>
      <p>
        Les données médicales sont traitées uniquement par des professionnels autorisés dans le cadre de
        leur mandat. Les échanges avec l&apos;assistant IA de suivi sont limités aux informations
        nécessaires à l&apos;accompagnement proactif du patient.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Télémédecine</h2>
      <p>
        MedSim est une plateforme de mise en relation et d&apos;accompagnement ; elle ne remplace pas une
        relation médecin-patient établie en personne lorsque la loi ou la clinique l&apos;exige. Les
        prescriptions sont émises uniquement après évaluation par un professionnel licencié.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Responsable de la protection</h2>
      <p>
        Pour toute question relative à la conformité :{" "}
        <a href="mailto:privacy@medsim.ca" className="text-[var(--teal-900)] underline">
          privacy@medsim.ca
        </a>
        . Voir aussi notre{" "}
        <Link href="/politique-confidentialite" className="text-[var(--teal-900)] underline">
          politique de confidentialité
        </Link>
        .
      </p>
      <p className="pt-4 text-xs text-slate-500">
        Document informatif — version démo. Une politique de gouvernance complète sera publiée avant mise
        en production grand public.
      </p>
    </LegalPageLayout>
  );
}
