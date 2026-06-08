import { GLP1_MEDICATIONS } from "@/lib/patient/glp1-content";
import { ELIGIBILITY_QUESTIONNAIRE_PATH } from "@/lib/patient/promo-banner-assets";

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
] as const;
