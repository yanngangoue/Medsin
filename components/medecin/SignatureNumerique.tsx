"use client";

import { useState } from "react";

type Props = {
  prescriptionId: string;
  onSigned: () => void;
};

export function SignatureNumerique({ prescriptionId, onSigned }: Props) {
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function sign() {
    setSigning(true);
    setError(null);
    const res = await fetch(`/api/medecin/ordonnance/${prescriptionId}/signer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Signature refusée");
      setSigning(false);
      return;
    }
    setDone(true);
    onSigned();
    setSigning(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        Ordonnance signée et envoyée au patient. Document archivé.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#16a34a] bg-white p-5">
      <h2 className="text-sm font-bold uppercase text-[#16a34a]">Signature électronique</h2>
      <ul className="mt-3 space-y-1 text-xs text-slate-700">
        <li>✓ J&apos;ai examiné le dossier complet</li>
        <li>✓ Ce traitement est cliniquement approprié pour ce patient</li>
        <li>✓ J&apos;assume la responsabilité médicale de cette prescription</li>
      </ul>
      <label className="mt-4 block text-xs font-medium text-slate-700">
        Confirmez votre mot de passe Anne Santé
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        autoComplete="current-password"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={!password || signing}
        onClick={() => void sign()}
        className="mt-4 w-full rounded-lg bg-[#16a34a] py-3 text-sm font-bold text-white hover:bg-[#15803d] disabled:opacity-40"
      >
        {signing ? "Signature…" : "SIGNER ET ÉMETTRE L'ORDONNANCE"}
      </button>
    </div>
  );
}
