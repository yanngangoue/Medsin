import { redirect } from "next/navigation";
import { poidsTabHref } from "@/lib/patient/dashboard-routes";

export default function CoachIaRedirectPage() {
  redirect(poidsTabHref("coach"));
}
