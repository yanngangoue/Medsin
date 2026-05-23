import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Politique de remboursement — MedSim",
  description: "Conditions de remboursement pour les services et commandes MedSim.",
};

export default function PolitiqueRemboursementPage() {
  return (
    <LegalPageLayout title="Politique de remboursement">
      <p>
        La présente politique décrit les conditions dans lesquelles un remboursement peut être demandé pour
        les services payants offerts sur MedSim. Elle complète notre page{" "}
        <Link href="/garantie" className="text-[var(--teal-900)] underline">
          Garantie
        </Link>
        .
      </p>

      <h2 className="pt-4 text-base font-semibold text-slate-900">Délai pour faire une demande</h2>
      <p>
        Toute demande de remboursement doit être soumise dans les <strong>14 jours</strong> suivant le
        paiement ou la livraison concernée, selon le type de service, via la page{" "}
        <Link href="/contact" className="text-[var(--teal-900)] underline">
          Contact
        </Link>
        , en précisant votre numéro de dossier ou de commande.
      </p>

      <h2 className="pt-4 text-base font-semibold text-slate-900">Parcours médical et abonnements</h2>
      <p>
        Les frais liés à une évaluation ou à un suivi déjà réalisé par un professionnel de santé ne sont
        généralement pas remboursables. Un remboursement partiel peut être étudié si le service n&apos;a pas
        été rendu (ex. consultation annulée par MedSim) ou en cas d&apos;erreur de facturation avérée.
      </p>

      <h2 className="pt-4 text-base font-semibold text-slate-900">Catalogue Nutri+ (compléments)</h2>
      <p>
        Pour une commande de compléments partenaires (poudres, gélules) :
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Produit non conforme ou endommagé</strong> : signalement dans les 48 h suivant la
          réception, avec photos si possible — remboursement ou nouvel envoi selon le cas.
        </li>
        <li>
          <strong>Annulation avant expédition</strong> : remboursement intégral si le partenaire n&apos;a pas
          encore expédié la commande (délai variable selon le fournisseur).
        </li>
        <li>
          <strong>Après réception acceptée</strong> : aucun remboursement sauf vice caché ou erreur prouvée
          de notre part ou du partenaire.
        </li>
      </ul>

      <h2 className="pt-4 text-base font-semibold text-slate-900">Modalités de remboursement</h2>
      <p>
        Les remboursements approuvés sont crédités sur le mode de paiement initial, dans un délai de 5 à 10
        jours ouvrables selon votre institution financière. Aucun remboursement en espèces n&apos;est
        effectué.
      </p>

      <h2 className="pt-4 text-base font-semibold text-slate-900">Cas non remboursables</h2>
      <p>
        Ne donnent pas lieu à remboursement : changement d&apos;avis après ouverture partielle des compléments,
        non-respect du plan de suivi convenu, informations erronées fournies au dossier, ou services déjà
        entièrement rendus conformément au contrat.
      </p>

      <p className="pt-4 text-xs text-slate-500">
        Version indicative — démo produit. Les modalités définitives seront confirmées au moment de votre
        achat et dans votre reçu de transaction.
      </p>
    </LegalPageLayout>
  );
}
