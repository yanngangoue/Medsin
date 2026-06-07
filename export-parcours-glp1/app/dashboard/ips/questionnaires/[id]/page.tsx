import { redirect } from "next/navigation";
import Link from "next/link";
import { IpsQuestionnaireReview } from "@/components/ips/IpsQuestionnaireReview";
import { requireIpsSession } from "@/lib/ips/auth";

type Props = { params: Promise<{ id: string }> };

export default async function IpsQuestionnairePage({ params }: Props) {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips");

  const { id } = await params;

  return (
    <div>
      <Link href="/dashboard/ips" className="text-sm font-medium text-[#1D4D3A] hover:underline">
        ← Retour aux dossiers
      </Link>
      <div className="mt-6">
        <IpsQuestionnaireReview questionnaireId={id} />
      </div>
    </div>
  );
}
