import { redirect } from "next/navigation";

/** URL historique — politique canonique : /confidentialite */
export default function PolitiqueConfidentialiteRedirectPage() {
  redirect("/confidentialite");
}
