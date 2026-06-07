import { redirect } from "next/navigation";

export default function PatientCoachRedirect() {
  redirect("/dashboard/patient/poids?tab=coach");
}
