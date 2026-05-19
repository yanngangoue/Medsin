export type RepasMeal = {
  id: string;
  src: string;
  alt: string;
  label: string;
  price: number;
};

/** Plats du menu — utilisés pour la galerie et la composition de boîte */
export const REPAS_MEALS: readonly RepasMeal[] = [
  {
    id: "petit-dejeuner",
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85",
    alt: "Bol de légumes, avocat et œufs",
    label: "Petit-déjeuner protéiné",
    price: 14.99,
  },
  {
    id: "salade-midi",
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=85",
    alt: "Salade fraîche aux légumes",
    label: "Salade du midi",
    price: 15.99,
  },
  {
    id: "diner-leger",
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85",
    alt: "Pizza santé aux légumes",
    label: "Dîner léger",
    price: 16.49,
  },
  {
    id: "saumon",
    src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7440?w=600&q=85",
    alt: "Assiette avec saumon et accompagnements",
    label: "Saumon grillé",
    price: 18.99,
  },
  {
    id: "collation",
    src: "https://images.unsplash.com/photo-1498837167922-ddd275ead614?w=600&q=85",
    alt: "Bol de fruits et granola",
    label: "Collation équilibrée",
    price: 12.99,
  },
  {
    id: "bol-metabolique",
    src: "https://images.unsplash.com/photo-1512058564366-58b49b738b7f?w=600&q=85",
    alt: "Riz, légumes et protéines",
    label: "Bol métabolique",
    price: 15.49,
  },
  {
    id: "chef-medsim",
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85",
    alt: "Plat gastronomique sain",
    label: "Chef MedSim",
    price: 19.99,
  },
  {
    id: "menu-soir",
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=85",
    alt: "Assiette variée grillée",
    label: "Menu du soir",
    price: 17.49,
  },
];

export const mealById = Object.fromEntries(REPAS_MEALS.map((m) => [m.id, m])) as Record<
  string,
  RepasMeal
>;

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(amount);
}
