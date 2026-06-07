import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{ checkout?: string }>;
};

export default async function PatientProgrammeRedirect({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const suffix =
    params.checkout === "success" ? "?tab=programme&checkout=success" : "?tab=programme";
  redirect(`/dashboard/patient/poids${suffix}`);
}
