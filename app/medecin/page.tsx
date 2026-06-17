import { redirect } from "next/navigation";

/** Pas d’accueil — redirection directe vers la file de dossiers. */
export default function MedecinHomePage() {
  redirect("/medecin/file");
}
