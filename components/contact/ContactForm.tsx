"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-900">
        Merci pour votre message. Notre équipe vous répondra dans un délai de 1 à 2 jours ouvrables.
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-prenom">Prénom</Label>
          <Input id="contact-prenom" name="prenom" required className="mt-1 h-11" />
        </div>
        <div>
          <Label htmlFor="contact-nom">Nom</Label>
          <Input id="contact-nom" name="nom" required className="mt-1 h-11" />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-email">Courriel</Label>
        <Input id="contact-email" name="email" type="email" required className="mt-1 h-11" />
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
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Envoyer le message
      </Button>
      <p className="text-xs text-slate-500">
        En envoyant ce formulaire, vous acceptez que MedSim traite vos renseignements conformément à
        notre politique de confidentialité.
      </p>
    </form>
  );
}
