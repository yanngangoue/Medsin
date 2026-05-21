import { redirect } from "next/navigation";

/** Médecins → file GLP-1 à revoir, sinon tableau de bord */
export default function MedecinPage() {
  redirect("/admin/patients?queue=a_revoir");
}
