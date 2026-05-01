"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/Field";

type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
};

function formatLocal(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/appointments");
    const json = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(json.appointments)) {
      setItems(json.appointments);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!datetimeLocal) {
      setError("Choisissez une date et une heure.");
      return;
    }
    const scheduledAt = new Date(datetimeLocal).toISOString();
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt, notes: notes || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Création impossible");
        return;
      }
      setNotes("");
      setDatetimeLocal("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Horaire</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Consultations</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Retour à l’accueil</Button>
          </Link>
        </div>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Nouvelle consultation</h2>
          <form className="mt-6 space-y-4" onSubmit={onCreate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="when">Date et heure</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={datetimeLocal}
                  onChange={(e) => setDatetimeLocal(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement…" : "Confirmer"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">À venir</h2>
          {items.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-600">Aucune consultation planifiée pour le moment.</p>
            </Card>
          ) : (
            <ul className="space-y-3">
              {items.map((a) => (
                <Card key={a.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{formatLocal(a.scheduledAt)}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{a.status}</p>
                    </div>
                  </div>
                  {a.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{a.notes}</p>
                  ) : null}
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
