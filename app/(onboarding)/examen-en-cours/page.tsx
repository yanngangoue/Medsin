import { ExamenEnCoursPanel } from "@/components/onboarding/ExamenEnCoursPanel";

export default function ExamenEnCoursPage() {
  return (
    <div>
      <p className="text-center text-xs font-bold uppercase tracking-wider text-[#1D4D3A]">
        Suivi · Dossier médical
      </p>
      <div className="mt-8">
        <ExamenEnCoursPanel />
      </div>
    </div>
  );
}
