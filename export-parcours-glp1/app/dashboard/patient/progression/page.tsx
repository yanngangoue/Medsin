import { redirect } from "next/navigation";

export default function PatientProgressionRedirect() {
  redirect("/dashboard/patient/poids?tab=progression");
}
