import { AdminIpsPanel } from "@/components/admin/AdminIpsPanel";

export default function AdminIpsPage() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <h1 className="text-xl font-bold text-slate-900">IPS & dossiers cliniques</h1>
        <p className="mt-1 text-sm text-slate-600">
          Supervision des infirmières praticiennes spécialisées et de la file des questionnaires
          médicaux.
        </p>
      </div>
      <AdminIpsPanel />
    </div>
  );
}
