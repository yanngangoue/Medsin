const DPO_EMAIL = "confidentialite@medsim.ca";
const LAST_UPDATED = "6 juin 2026";

export function ConfidentialiteContent() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-4 py-12 prose-headings:text-[#1A1A2E] prose-p:text-[#1A1A2E]/80">
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-[#6B7280]">Dernière mise à jour : {LAST_UPDATED}</p>

      <h2>Qui sommes-nous</h2>
      <p>
        MedSim Inc. est une plateforme médicale québécoise spécialisée en gestion du poids avec
        traitements GLP-1. Siège au Québec, Canada.
      </p>

      <h2>Données collectées et finalités</h2>
      <ul>
        <li>Identité et coordonnées (inscription, facturation)</li>
        <li>Données médicales (questionnaires, ordonnances, suivi poids)</li>
        <li>Échanges clavardage patient–IPS et avec Anne (coach santé IA)</li>
        <li>Données de paiement (traitées par Stripe — nous ne stockons pas vos numéros de carte)</li>
      </ul>

      <h2>Protection des données</h2>
      <ul>
        <li>Chiffrement AES-256 des données médicales sensibles au repos</li>
        <li>Transport HTTPS / TLS uniquement</li>
        <li>Clés API pharmacies chiffrées en base de données</li>
        <li>Ordonnances PDF signées numériquement</li>
        <li>Journal d&apos;audit pour chaque accès à un dossier médical</li>
      </ul>

      <h2>Partage des données</h2>
      <p>Nous partageons vos données uniquement avec :</p>
      <ul>
        <li>Votre IPS et, si requis, le médecin superviseur</li>
        <li>La pharmacie partenaire pour la dispensation</li>
        <li>Stripe (paiements)</li>
        <li>Anthropic (coach IA — données anonymisées contextuellement, sans diagnostic)</li>
      </ul>

      <h2>Vos droits (Loi 25 et LPRPDE)</h2>
      <ul>
        <li>Accès et portabilité (export JSON depuis votre espace patient)</li>
        <li>Rectification des données inexactes</li>
        <li>Effacement / anonymisation du compte</li>
        <li>Retrait du consentement (toggles granulaires)</li>
        <li>Connaissance des accès à votre dossier (journal d&apos;audit)</li>
      </ul>

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

      <h2>Responsable de la protection des données</h2>
      <p>
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
      </p>

      <p className="text-sm text-[#6B7280]">
        Conforme à la Loi 25 (Québec) et à la LPRPDE (Canada).
      </p>
    </article>
  );
}
