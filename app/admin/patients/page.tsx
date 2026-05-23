import { Suspense } from "react";
import { PatientTable } from "@/components/admin/PatientTable";

type Props = {
  searchParams: Promise<{ queue?: string }>;
};

export default async function AdminPatientsPage({ searchParams }: Props) {
  const { queue } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
      <p className="mt-1 text-sm text-slate-600">
        Dossiers GLP-1 — recherche, filtres et pagination
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-slate-500">Chargement…</p>}>
          <PatientTable initialQueue={queue} />
        </Suspense>
      </div>
    </div>
  );
}
