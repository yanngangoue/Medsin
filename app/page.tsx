import { PublicPatientCatalog } from "@/components/patient/PublicPatientCatalog";

/** Page d’accueil — catalogue des services Medsim. */
export default function HomePage() {
  return <PublicPatientCatalog showAuthLinks={false} />;
}
