import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Politique de confidentialité — MedSim",
  description: "Comment MedSim collecte, utilise et protège vos renseignements personnels.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageLayout title="Politique de confidentialité">
      <p>
        MedSim respecte la vie privée des personnes dont nous traitons les renseignements personnels, en
        conformité avec la Loi sur la protection des renseignements personnels dans le secteur privé au
        Québec (Loi 25) et les lois applicables au Canada.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Renseignements collectés</h2>
      <p>
        Nous pouvons collecter : identité et coordonnées, renseignements médicaux nécessaires à votre
        parcours, données de navigation sur la plateforme, et échanges avec l&apos;assistant IA de suivi.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Utilisation</h2>
      <p>
        Vos données servent à fournir les services demandés, assurer le suivi par les professionnels
        autorisés, améliorer la plateforme et respecter nos obligations légales. Nous ne vendons pas vos
        renseignements personnels.
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Conservation et sécurité</h2>
      <p>
        Les renseignements sont conservées aussi longtemps que nécessaire aux fins du traitement et
        protégées par des mesures techniques et organisationnelles adaptées (chiffrement, contrôle
        d&apos;accès, journalisation).
      </p>
      <h2 className="pt-4 text-base font-semibold text-slate-900">Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos renseignements, sous
        réserve des obligations légales et médicales. Pour exercer vos droits :{" "}
        <a href="mailto:privacy@medsim.ca" className="text-[var(--teal-900)] underline">
          privacy@medsim.ca
        </a>{" "}
        ou via la page{" "}
        <Link href="/contact" className="text-[var(--teal-900)] underline">
          Contact
        </Link>
        .
      </p>
      <p className="pt-4 text-xs text-slate-500">
        Dernière mise à jour : version démo — texte à valider par votre responsable de la protection des
        renseignements personnels (RPRP).
      </p>
    </LegalPageLayout>
  );
}
