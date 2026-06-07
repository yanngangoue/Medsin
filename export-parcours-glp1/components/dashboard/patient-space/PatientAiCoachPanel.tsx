"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { poidsBtnPrimary, poidsCard, poidsMeta, poidsTitle } from "@/lib/patient/poids-design";
import { poidsTabHref } from "@/lib/patient/dashboard-routes";
import type { AiCoachMessagePublic } from "@/lib/patient/ai-coach";

type Props = {
  compact?: boolean;
  /** Incrémenter après un check-in pour recharger les messages proactifs. */
  refreshToken?: number;
};

export function PatientAiCoachPanel({ compact = false, refreshToken = 0 }: Props) {
  const [messages, setMessages] = useState<AiCoachMessagePublic[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch("/api/patient/weight-program/coach");
    if (res.ok) {
      const data = (await res.json()) as { messages?: AiCoachMessagePublic[] };
      setMessages(data.messages ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    void loadMessages();
  }, [loadMessages, refreshToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    setInput("");

    const res = await fetch("/api/patient/weight-program/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Impossible d'envoyer le message.");
      setSending(false);
      return;
    }

    const data = (await res.json()) as {
      userMessage: AiCoachMessagePublic;
      assistantMessage: AiCoachMessagePublic;
    };
    setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);
    setSending(false);
  }

  const heightClass = compact ? "max-h-64" : "max-h-[28rem]";

  return (
    <section className={compact ? `${poidsCard} p-5` : poidsCard}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-sm text-[#1D4D3A]">
            ✦
          </span>
          <div>
            <h2 className={poidsTitle}>Anne — coach santé</h2>
            <p className="text-xs text-slate-500">Assistant proactif — pas un avis médical</p>
          </div>
        </div>
        {compact ? (
          <Link href={poidsTabHref("coach")} className="text-xs font-semibold text-[#1D4D3A] hover:underline">
            Plein écran →
          </Link>
        ) : null}
      </div>

      <div
        className={`mt-4 overflow-y-auto rounded-xl border border-slate-100 bg-[#FAFAF8] p-3 ${heightClass}`}
      >
        {loading ? (
          <DashboardSpinner label="Chargement de la conversation…" />
        ) : messages.length === 0 ? (
          <p className={poidsMeta}>
            Votre coach vous accueillera ici dès que votre programme est actif.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1D4D3A] text-white"
                      : "border border-slate-200/80 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez à Anne…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1D4D3A] focus:ring-1 focus:ring-[#1D4D3A]/25"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()} className={`shrink-0 py-2.5 ${poidsBtnPrimary}`}>
          {sending ? "…" : "Envoyer"}
        </button>
      </form>
    </section>
  );
}
