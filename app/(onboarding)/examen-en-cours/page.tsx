import Link from "next/link";
import { dsBtnPrimary, dsCard } from "@/lib/design-system";

export default function ExamenEnCoursPage() {
  return (
    <div className={`${dsCard} mx-auto max-w-lg text-center`}>
      <p className="text-4xl" aria-hidden>
        📋
      </p>
      <h1 className="mt-4 text-2xl font-bold text-[#1A1A2E]">Votre dossier est en cours d&apos;examen</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        Une infirmière praticienne spécialisée (IPS) MedSim examine votre questionnaire. Vous recevrez
        un courriel de confirmation et une réponse sous <strong>48 heures</strong>.
      </p>
      <Link href="/dashboard/patient" className={`mt-8 ${dsBtnPrimary}`}>
        Accéder à mon espace
      </Link>
    </div>
  );
}
