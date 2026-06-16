"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      prenom: (fd.get("prenom") as string) ?? "",
      nom: (fd.get("nom") as string) ?? "",
      email: (fd.get("email") as string) ?? "",
      sujet: (fd.get("sujet") as string) ?? "",
      message: (fd.get("message") as string) ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      setSent(true);
    } catch {
      setError("Impossible d'envoyer le message. Vérifiez votre connexion.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
        <p className="text-2xl">✓</p>
        <p className="mt-2 font-semibold text-emerald-900">Message envoyé !</p>
        <p className="mt-1 text-sm text-emerald-800">
          Notre équipe vous répondra dans un délai de 1 à 2 jours ouvrables.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-prenom">Prénom</Label>
          <Input id="contact-prenom" name="prenom" required autoComplete="given-name" className="mt-1 h-11" />
        </div>
        <div>
          <Label htmlFor="contact-nom">Nom</Label>
          <Input id="contact-nom" name="nom" required autoComplete="family-name" className="mt-1 h-11" />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-email">Courriel</Label>
        <Input id="contact-email" name="email" type="email" required autoComplete="email" className="mt-1 h-11" />
      </div>
      <div>
        <Label htmlFor="contact-sujet">Sujet</Label>
        <Input id="contact-sujet" name="sujet" required className="mt-1 h-11" />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          minLength={10}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <Button type="submit" disabled={sending} className="w-full sm:w-auto">
        {sending ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
      <p className="text-xs text-slate-500">
        En envoyant ce formulaire, vous acceptez que MedSim traite vos renseignements conformément à
        notre{" "}
        <a href="/confidentialite" className="underline hover:text-slate-800">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
