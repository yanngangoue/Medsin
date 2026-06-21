import { redirect } from "next/navigation";

/** Redirection legacy → /dashboard/pharmacie */
export default function PharmacienLegacyRedirect() {
  redirect("/dashboard/pharmacie");
}
