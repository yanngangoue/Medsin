import { GLP1_MEDICATIONS } from "@/lib/patient/glp1-content";
import { ELIGIBILITY_QUESTIONNAIRE_PATH } from "@/lib/patient/promo-banner-assets";
import { PUBLIC_HERO_CTAS } from "@/lib/patient/patient-hub";

export type CatalogFelixNavLink = {
  href: string;
  label: string;
  description?: string;
};

export type CatalogFelixNavMenu = {
  id: string;
  label: string;
  items: readonly CatalogFelixNavLink[];
};

const MEDICATION_LINKS: CatalogFelixNavLink[] = GLP1_MEDICATIONS.map((med) => ({
  href: ELIGIBILITY_QUESTIONNAIRE_PATH,
  label: `${med.name}®`,
  description: `${med.ingredient} · ${med.form}`,
}));

export const CATALOG_FELIX_NAV_MENUS: readonly CatalogFelixNavMenu[] = [
  {
    id: "medicaments",
    label: "Médicaments",
    items: MEDICATION_LINKS,
  },
  {
    id: "contact",
    label: "Contact",
    items: [
      { href: "/contact", label: "Nous contacter", description: "Message ou demande d'information" },
      {
        href: ELIGIBILITY_QUESTIONNAIRE_PATH,
        label: "Vérifier mon éligibilité",
        description: "Commencer gratuitement",
      },
      {
        href: PUBLIC_HERO_CTAS.login.href,
        label: PUBLIC_HERO_CTAS.login.label,
        description: "Accéder à votre espace",
      },
    ],
  },
] as const;
