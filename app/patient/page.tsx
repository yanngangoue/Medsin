import { redirect } from "next/navigation";

/** Ancienne URL du catalogue — redirection vers l’accueil. */
export default function PatientLegacyRedirectPage() {
  redirect("/");
}
