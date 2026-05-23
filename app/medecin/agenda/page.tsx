import Link from "next/link";

export default function MedecinAgendaPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>
      <p className="mt-2 text-sm text-slate-600">
        Agenda téléconsultation —{" "}
        <Link href="/admin/teleconsultations" className="text-[#16a34a] hover:underline">
          voir les rendez-vous planifiés
        </Link>
        .
      </p>
    </div>
  );
}
