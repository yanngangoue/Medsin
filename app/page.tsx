import { auth } from "@/auth";
import { PublicPatientCatalog } from "@/components/patient/PublicPatientCatalog";
import { loadPatientHubContext } from "@/lib/patient/load-patient-hub-context";

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[HomePage] auth() failed:", e);
  }

  if (session?.user?.role === "PATIENT" && session.user.id) {
    let hubContext = null;
    try {
      hubContext = await loadPatientHubContext(session.user.id);
    } catch (e) {
      console.error("[HomePage] loadPatientHubContext failed:", e);
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
