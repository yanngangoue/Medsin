import { auth } from "@/auth";
import { PublicPatientCatalog } from "@/components/patient/PublicPatientCatalog";
import { loadPatientHubContext } from "@/lib/patient/load-patient-hub-context";

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // auth() peut échouer si NEXTAUTH_URL est mal configuré — la page s'affiche quand même
  }

  if (session?.user?.role === "PATIENT" && session.user.id) {
    let hubContext = null;
    try {
      hubContext = await loadPatientHubContext(session.user.id);
    } catch {
      // La page s'affiche en mode public si le contexte patient est indisponible
    }
    if (hubContext) {
      return (
        <PublicPatientCatalog
          connectedPatient={{
            prenom: session.user.prenom ?? session.user.name ?? "",
            hubContext,
          }}
        />
      );
    }
  }

  return <PublicPatientCatalog />;
}
