"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminInvitableRole } from "@/lib/admin/staff-roles";
import type { StaffMemberRow } from "@/lib/admin/invite-staff";

type FormState = {
  role: AdminInvitableRole;
  prenom: string;
  nom: string;
  email: string;
  notificationEmail: string;
  licenseNumber: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyCity: string;
  pharmacyProvince: string;
  pharmacyPhone: string;
};

const EMPTY: FormState = {
  role: "IPS",
  prenom: "",
  nom: "",
  email: "",
  notificationEmail: "",
  licenseNumber: "",
  pharmacyName: "",
  pharmacyAddress: "",
  pharmacyCity: "",
  pharmacyProvince: "QC",
  pharmacyPhone: "",
};

export function AdminTeamPanel() {
  const [members, setMembers] = useState<StaffMemberRow[]>([]);
  const [emailDomain, setEmailDomain] = useState("anne-sante.ca");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/team");
    if (res.ok) {
      const data = (await res.json()) as {
        members: StaffMemberRow[];
        emailDomain: string;
      };
      setMembers(data.members);
      setEmailDomain(data.emailDomain);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!form.prenom.trim() || !form.nom.trim()) return;
    if (form.email.trim()) return;
    const t = setTimeout(() => {
      void fetch(
        `/api/admin/team?propose=email&prenom=${encodeURIComponent(form.prenom)}&nom=${encodeURIComponent(form.nom)}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { email?: string } | null) => {
          if (data?.email) {
            setForm((f) => (f.email ? f : { ...f, email: data.email! }));
          }
        });
    }, 400);
    return () => clearTimeout(t);
  }, [form.prenom, form.nom, form.email]);

  async function proposeEmail() {
    const res = await fetch(
      `/api/admin/team?propose=email&prenom=${encodeURIComponent(form.prenom)}&nom=${encodeURIComponent(form.nom)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { email: string };
      setForm((f) => ({ ...f, email: data.email }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    setInviteUrl(null);

    const body: Record<string, unknown> = {
      role: form.role,
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim() || undefined,
      notificationEmail: form.notificationEmail.trim() || undefined,
      licenseNumber: form.licenseNumber.trim() || undefined,
      sendInvite: true,
    };

    if (form.role === "PHARMACIEN") {
      body.pharmacy = {
        name: form.pharmacyName.trim(),
        address: form.pharmacyAddress.trim(),
        city: form.pharmacyCity.trim(),
        province: form.pharmacyProvince.trim(),
        phone: form.pharmacyPhone.trim(),
      };
    }

    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        inviteUrl?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) {
        const fieldErr = data.details?.fieldErrors;
        const firstField = fieldErr
          ? Object.values(fieldErr).flat()[0]
          : undefined;
        throw new Error(firstField ?? data.error ?? "Création impossible");
      }
      setMessage(data.message ?? "Membre ajouté.");
      if (data.inviteUrl) setInviteUrl(data.inviteUrl);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function resendInvite(id: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    setInviteUrl(null);
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-invite" }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        inviteUrl?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Échec");
      setMessage(data.message ?? "Invitation renvoyée.");
      if (data.inviteUrl) setInviteUrl(data.inviteUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  const ipsMembers = members.filter((m) => m.role === "IPS");
  const medecinMembers = members.filter((m) => m.role === "MEDECIN");
  const pharmaMembers = members.filter((m) => m.role === "PHARMACIEN");

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p>
          <strong>Réservé à l&apos;administrateur.</strong> Seul un admin peut créer des comptes
          IPS, médecins et pharmaciens. Chaque membre reçoit un identifiant{" "}
          <strong>prenom.nom@{emailDomain}</strong>, se connecte avec ce courriel et crée son mot de
          passe via l&apos;invitation.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {inviteUrl ? (
        <InviteLinkBanner url={inviteUrl} onDismiss={() => setInviteUrl(null)} />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Inviter un membre</h2>
        <p className="mt-1 text-sm text-slate-600">
          Le courriel Anne-sante sert d&apos;identifiant de connexion. Le membre définit son mot de passe
          via le lien d&apos;activation envoyé par courriel.
        </p>

        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-5" autoComplete="off" noValidate>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["IPS", "Infirmière IPS"],
                ["MEDECIN", "Médecin"],
                ["PHARMACIEN", "Pharmacie partenaire"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                  form.role === value
                    ? "border-[#16a34a] bg-emerald-50 text-[#14532d]"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={form.role === value}
                  onChange={() => setForm((f) => ({ ...f, role: value }))}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {form.role === "IPS" ? (
              <>
                <strong className="text-slate-900">Accès IPS — questionnaires GLP-1</strong>
                <p className="mt-1">
                  L&apos;IPS consulte les dossiers patients confidentiels sur{" "}
                  <span className="font-medium">/dashboard/ips</span> (file d&apos;attente), pas sur
                  le portail médecin <span className="font-medium">/medecin</span>.
                </p>
              </>
            ) : null}
            {form.role === "MEDECIN" ? (
              <>
                <strong className="text-slate-900">Accès médecin — supervision clinique</strong>
                <p className="mt-1">
                  Le médecin accède aux dossiers legacy sur{" "}
                  <span className="font-medium">/medecin/file</span>. Pour le parcours GLP-1 IPS, choisissez
                  plutôt le rôle IPS.
                </p>
              </>
            ) : null}
            {form.role === "PHARMACIEN" ? (
              <>
                <strong className="text-slate-900">Accès pharmacie</strong>
                <p className="mt-1">
                  Suivi des ordonnances et livraisons sur{" "}
                  <span className="font-medium">/pharmacien</span>.
                </p>
              </>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" required>
              <input
                value={form.prenom}
                onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Nom" required>
              <input
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                className={inputClass}
                required
              />
            </Field>
          </div>

          <Field
            label={`Identifiant de connexion (@${emailDomain})`}
            hint="Basé sur le nom — utilisé comme courriel pour se connecter"
          >
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={`prenom.nom@${emailDomain}`}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => void proposeEmail()}
                className="shrink-0 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Proposer
              </button>
            </div>
          </Field>

          <Field
            label="Courriel pour recevoir l'invitation"
            hint="Personnel (Gmail, etc.) — le lien d'activation y est envoyé tant que @anne-sante.ca n'a pas de boîte mail"
          >
            <input
              type="email"
              value={form.notificationEmail}
              onChange={(e) => setForm((f) => ({ ...f, notificationEmail: e.target.value }))}
              placeholder="marie@gmail.com"
              className={inputClass}
            />
          </Field>

          {form.role === "IPS" ? (
            <Field label="Numéro de permis IPS" required>
              <input
                value={form.licenseNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                placeholder="IPS-XXXX"
                className={inputClass}
                required
              />
            </Field>
          ) : null}

          {form.role === "MEDECIN" ? (
            <Field label="Numéro de permis médical" required>
              <input
                value={form.licenseNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                placeholder="Ex. 12345"
                className={inputClass}
                required
              />
            </Field>
          ) : null}

          {form.role === "PHARMACIEN" ? (
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-800">Pharmacie partenaire</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom de la pharmacie" required>
                  <input
                    value={form.pharmacyName}
                    onChange={(e) => setForm((f) => ({ ...f, pharmacyName: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Téléphone" required>
                  <input
                    value={form.pharmacyPhone}
                    onChange={(e) => setForm((f) => ({ ...f, pharmacyPhone: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adresse" required>
                    <input
                      value={form.pharmacyAddress}
                      onChange={(e) => setForm((f) => ({ ...f, pharmacyAddress: e.target.value }))}
                      className={inputClass}
                      required
                    />
                  </Field>
                </div>
                <Field label="Ville" required>
                  <input
                    value={form.pharmacyCity}
                    onChange={(e) => setForm((f) => ({ ...f, pharmacyCity: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Province" required>
                  <input
                    value={form.pharmacyProvince}
                    onChange={(e) => setForm((f) => ({ ...f, pharmacyProvince: e.target.value }))}
                    maxLength={2}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#16a34a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
          >
            {busy ? "Création…" : "Créer et envoyer l'invitation"}
          </button>
        </form>
      </section>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <>
          <MemberTable
            title="Infirmières IPS"
            members={ipsMembers}
            onResend={(id) => void resendInvite(id)}
            busy={busy}
          />
          <MemberTable
            title="Médecins"
            members={medecinMembers}
            onResend={(id) => void resendInvite(id)}
            busy={busy}
          />
          <MemberTable
            title="Pharmaciens partenaires"
            members={pharmaMembers}
            onResend={(id) => void resendInvite(id)}
            busy={busy}
          />
        </>
      )}
    </div>
  );
}

function MemberTable({
  title,
  members,
  onResend,
  busy,
}: {
  title: string;
  members: StaffMemberRow[];
  onResend: (id: string) => void;
  busy: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{members.length} membre(s)</p>
      </div>
      {members.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">Aucun membre pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Identifiant</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Détail</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{m.email}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {m.role === "PHARMACIEN"
                      ? (m.pharmacyName ?? "—")
                      : (m.licenseNumber ?? "—")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {m.status === "invited" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onResend(m.id)}
                        className="text-xs font-semibold text-[#16a34a] hover:underline disabled:opacity-50"
                      >
                        Renvoyer l&apos;invitation
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: "invited" | "active" }) {
  if (status === "active") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
        Actif
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
      Invitation envoyée
    </span>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">
        {label}
        {required ? " *" : ""}
      </span>
      {hint ? <span className="mt-0.5 block text-[11px] text-slate-400">{hint}</span> : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20";

function InviteLinkBanner({ url, onDismiss }: { url: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#16a34a]/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
      <p className="font-medium">Lien d&apos;activation (valide 7 jours)</p>
      <p className="mt-1 break-all font-mono text-xs">{url}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803d]"
        >
          {copied ? "Copié" : "Copier le lien"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-[#16a34a] px-3 py-1.5 text-xs font-semibold text-[#16a34a] hover:bg-white"
        >
          Ouvrir
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-slate-500 hover:underline"
        >
          Masquer
        </button>
      </div>
    </div>
  );
}
