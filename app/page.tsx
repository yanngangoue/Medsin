import { auth } from "@/auth";
import { PublicPatientCatalog } from "@/components/patient/PublicPatientCatalog";
import { loadPatientHubContext } from "@/lib/patient/load-patient-hub-context";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === "PATIENT" && session.user.id) {
    const hubContext = await loadPatientHubContext(session.user.id);
    return (
      <PublicPatientCatalog
        connectedPatient={{
          prenom: session.user.prenom ?? session.user.name ?? "",
          hubContext,
        }}
      />
    );
  }

  return <PublicPatientCatalog />;
}
