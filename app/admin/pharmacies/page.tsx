import { AdminPharmaciesPanel } from "@/components/admin/AdminPharmaciesPanel";

export default function AdminPharmaciesPage() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <h1 className="text-xl font-bold text-slate-900">Pharmacie & livraisons</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gestion des ordonnances envoyées aux pharmacies partenaires et suivi des expéditions.
        </p>
      </div>
      <AdminPharmaciesPanel />
    </div>
  );
}
