import Link from "next/link";

const DPO_EMAIL = "confidentialite@medsim.ca";
const LAST_UPDATED = "6 juin 2026";

export function ConfidentialiteContent() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-4 py-12 prose-headings:text-[#1A1A2E] prose-p:text-[#1A1A2E]/80">
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-[#6B7280]">Dernière mise à jour : {LAST_UPDATED}</p>

      <p>
        Anne-sante respecte la vie privée des personnes dont nous traitons les renseignements personnels,
        en conformité avec la{" "}
        <em>Loi sur la protection des renseignements personnels dans le secteur privé</em> au Québec
        (Loi 25) et la <em>Loi sur la protection des renseignements personnels et les documents
        électroniques</em> (LPRPDE) au Canada.
      </p>

      <h2>Qui sommes-nous</h2>
      <p>
        Anne-sante Inc. est une plateforme médicale québécoise spécialisée en gestion du poids avec
        traitements GLP-1. Siège au Québec, Canada.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>Identité et coordonnées (inscription, facturation)</li>
        <li>Données médicales (questionnaires GLP-1, ordonnances, suivi du poids)</li>
        <li>Échanges clavardage patient–IPS et avec Anne (coach santé IA)</li>
        <li>Données de navigation essentielles au fonctionnement de la plateforme</li>
        <li>Données de paiement (traitées par Stripe — nous ne stockons pas vos numéros de carte)</li>
      </ul>

      <h2>Utilisation des données</h2>
      <p>
        Vos renseignements servent à fournir les services demandés, assurer le suivi par les
        professionnels autorisés, améliorer la plateforme et respecter nos obligations légales.{" "}
        <strong>Nous ne vendons pas vos renseignements personnels.</strong>
      </p>

      <h2>Protection des données</h2>
      <ul>
        <li>Chiffrement AES-256 des données médicales sensibles au repos</li>
        <li>Transport HTTPS / TLS uniquement</li>
        <li>Clés API pharmacies chiffrées en base de données</li>
        <li>Ordonnances PDF signées numériquement</li>
        <li>Journal d&apos;audit pour chaque accès à un dossier médical</li>
        <li>Contrôle d&apos;accès par rôle (patient, IPS, médecin, admin)</li>
      </ul>

      <h2>Partage des données</h2>
      <p>Nous partageons vos données uniquement avec :</p>
      <ul>
        <li>Votre IPS et, si requis, le médecin superviseur</li>
        <li>La pharmacie partenaire pour la dispensation</li>
        <li>Stripe (paiements)</li>
        <li>Anthropic (coach IA — contexte limité au suivi, sans diagnostic autonome)</li>
      </ul>

      <h2>Vos droits (Loi 25 et LPRPDE)</h2>
      <ul>
        <li>Accès et portabilité (export JSON depuis votre espace patient)</li>
        <li>Rectification des données inexactes</li>
        <li>Effacement / anonymisation du compte, sous réserve des obligations médicales et légales</li>
        <li>Retrait du consentement (paramètres granulaires dans votre espace)</li>
        <li>Connaissance des accès à votre dossier (journal d&apos;audit)</li>
      </ul>
      <p>
        Patients connectés : gérez vos consentements et exportez vos données depuis{" "}
        <Link href="/dashboard/patient/confidentialite" className="text-[#1D4D3A] underline">
          Confidentialité et consentements
        </Link>
        . Pour toute demande :{" "}
        <a href={`mailto:${DPO_EMAIL}`} className="text-[#1D4D3A] underline">
          {DPO_EMAIL}
        </a>{" "}
        ou la page{" "}
        <Link href="/contact" className="text-[#1D4D3A] underline">
          Contact
        </Link>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        Cookies essentiels uniquement (session, sécurité). Aucun cookie publicitaire ni tracking
        tiers à des fins marketing.
      </p>

      <h2>Rétention</h2>
      <ul>
        <li>Données médicales : 7 ans (obligation légale)</li>
        <li>Logs de clavardage : 2 ans</li>
        <li>Données marketing : suppression sur demande immédiate</li>
      </ul>

      <h2>Responsable de la protection des renseignements personnels</h2>
      <p>
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
      </p>
    </article>
  );
}
