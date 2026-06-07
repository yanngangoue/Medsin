import { redirect } from "next/navigation";
import { IpsQuestionnaireReview } from "@/components/ips/IpsQuestionnaireReview";
import { requireIpsSession } from "@/lib/ips/auth";

type Props = { params: Promise<{ id: string }> };

export default async function IpsQuestionnairePage({ params }: Props) {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips");

  const { id } = await params;

  return <IpsQuestionnaireReview questionnaireId={id} />;
}
