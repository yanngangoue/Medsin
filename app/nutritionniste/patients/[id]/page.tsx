"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

type CheckIn = {
  id: string;
  weight: number;
  energie: number | null;
  sommeil: number | null;
  nausee: number | null;
  notes: string | null;
  isEscalation: boolean;
  recordedAt: string;
};

type PatientDetail = {
  patient: {
    id: string;
    prenom: string;
    nom: string | null;
    email: string;
    age: number | null;
    gender: string | null;
    bmi: number | null;
    weightKg: number | null;
    heightCm: number | null;
    eligibility: string | null;
  };
  weightProgram: {
    id: string;
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
    medication: string | null;
    currentDose: string | null;
    startDate: string;
    isActive: boolean;
  } | null;
  checkIns: CheckIn[];
  questionnaire: {
    ipsNotes: string | null;
    approvedAt: string | null;
  } | null;
  nutritionData: {
    nutritionNotes: string | null;
    dietaryPlan: string | null;
    supplements: string | null;
    nextReviewDate: string | null;
  };
};

export default function NutritionnnistePatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notes, setNotes] = useState({ nutritionNotes: "", dietaryPlan: "", supplements: "", nextReviewDate: "" });

  useEffect(() => {
    fetch(`/api/nutritionniste/patients/${id}`)
      .then((r) => r.json())
      .then((d: PatientDetail) => {
        setData(d);
        setNotes({
          nutritionNotes: d.nutritionData.nutritionNotes ?? "",
          dietaryPlan: d.nutritionData.dietaryPlan ?? "",
          supplements: d.nutritionData.supplements ?? "",
          nextReviewDate: d.nutritionData.nextReviewDate ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/nutritionniste/patients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notes),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <p className="text-sm text-slate-500">Patient introuvable ou accès refusé.</p>
        <button onClick={() => router.push("/nutritionniste")} className="text-sm text-[#1D4D3A] underline">
          Retour
        </button>
      </div>
    );
  }

  const { patient, weightProgram, checkIns, questionnaire, nutritionData: _ } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/nutritionniste" aria-label="Retour">
            <MedsimLogo />
          </Link>
          <span className="text-xs font-medium text-slate-500">Dossier patient</span>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-slate-600">
            ← Retour
          </button>
          <h1 className="text-xl font-semibold text-slate-900">
            {patient.prenom} {patient.nom}
          </h1>
          {patient.eligibility === "ELIGIBLE" && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Suivi actif
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Âge", value: patient.age ? `${patient.age} ans` : "—" },
            { label: "IMC", value: patient.bmi ? patient.bmi.toFixed(1) : "—" },
            { label: "Poids", value: patient.weightKg ? `${patient.weightKg} kg` : "—" },
            { label: "Taille", value: patient.heightCm ? `${patient.heightCm} cm` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Programme de poids */}
        {weightProgram && (
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Programme GLP-1</h2>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Médicament</p>
                <p className="font-medium text-slate-800">{weightProgram.medication ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Dose actuelle</p>
                <p className="font-medium text-slate-800">{weightProgram.currentDose ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Poids initial → cible</p>
                <p className="font-medium text-slate-800">
                  {weightProgram.startWeight} kg → {weightProgram.targetWeight} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Début programme</p>
                <p className="font-medium text-slate-800">
                  {new Date(weightProgram.startDate).toLocaleDateString("fr-CA")}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Notes IPS */}
        {questionnaire?.ipsNotes && (
          <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <h2 className="mb-2 text-sm font-semibold text-blue-800">Notes cliniques IPS</h2>
            <p className="whitespace-pre-wrap text-sm text-blue-900">{questionnaire.ipsNotes}</p>
          </section>
        )}

        {/* Historique check-ins */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Historique check-ins ({checkIns.length})
          </h2>
          {checkIns.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-6 text-center text-sm text-slate-500">
              Aucun check-in enregistré.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Date", "Poids", "Énergie", "Sommeil", "Nausée", "Escalade"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {checkIns.map((c) => (
                    <tr key={c.id} className={c.isEscalation ? "bg-red-50/60" : "hover:bg-slate-50/50"}>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(c.recordedAt).toLocaleDateString("fr-CA")}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.weight} kg</td>
                      <td className="px-4 py-3 text-slate-600">{c.energie ?? "—"}/10</td>
                      <td className="px-4 py-3 text-slate-600">{c.sommeil ?? "—"}/10</td>
                      <td className="px-4 py-3 text-slate-600">{c.nausee ?? "—"}/10</td>
                      <td className="px-4 py-3">
                        {c.isEscalation ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Oui</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Notes nutritionniste */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Plan nutritionnel & notes</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Notes cliniques</label>
              <textarea
                rows={4}
                value={notes.nutritionNotes}
                onChange={(e) => setNotes((n) => ({ ...n, nutritionNotes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#1D4D3A] focus:outline-none"
                placeholder="Observations, constats cliniques…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Plan alimentaire</label>
              <textarea
                rows={4}
                value={notes.dietaryPlan}
                onChange={(e) => setNotes((n) => ({ ...n, dietaryPlan: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#1D4D3A] focus:outline-none"
                placeholder="Recommandations alimentaires personnalisées…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Suppléments recommandés</label>
              <textarea
                rows={2}
                value={notes.supplements}
                onChange={(e) => setNotes((n) => ({ ...n, supplements: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#1D4D3A] focus:outline-none"
                placeholder="Vitamines, minéraux, protéines…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Prochaine révision</label>
              <input
                type="date"
                value={notes.nextReviewDate}
                onChange={(e) => setNotes((n) => ({ ...n, nextReviewDate: e.target.value }))}
                className="rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#1D4D3A] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-[#1D4D3A] px-5 py-2 text-sm font-medium text-white hover:bg-[#163d2e] disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              {saved && <span className="text-sm text-emerald-600">Enregistré ✓</span>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
