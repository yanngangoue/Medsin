import Link from "next/link";

export default function MedecinPatientsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Mes patients</h1>
      <p className="mt-2 text-sm text-slate-600">
        Liste dédiée à venir. Utilisez la{" "}
        <Link href="/medecin/file" className="font-medium text-[#16a34a] hover:underline">
          file de travail
        </Link>{" "}
        pour examiner les dossiers GLP-1 en attente.
      </p>
    </div>
  );
}
