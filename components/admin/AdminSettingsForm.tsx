"use client";

import { useState } from "react";

type Props = {
  prenom: string;
  email: string;
};

export function AdminSettingsForm({ prenom, email }: Props) {
  const [displayName, setDisplayName] = useState(prenom);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="text-xs font-medium text-slate-600">Nom affiché</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Courriel</label>
        <input
          type="email"
          value={email}
          readOnly
          className="mt-1 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Nouveau mot de passe</label>
        <input
          type="password"
          placeholder="••••••••"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          MVP : changement de mot de passe à brancher sur une route sécurisée.
        </p>
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#16a34a]"
        />
        Notifications par courriel
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803d]"
      >
        Enregistrer
      </button>
      {saved ? (
        <p className="text-sm text-[#16a34a]">Préférences enregistrées (local).</p>
      ) : null}
    </form>
  );
}
