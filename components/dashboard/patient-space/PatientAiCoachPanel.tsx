"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { poidsBtnPrimary, poidsCard, poidsMeta, poidsTitle } from "@/lib/patient/poids-design";
import type { AiCoachMessagePublic } from "@/lib/patient/ai-coach";

type Props = {
  compact?: boolean;
  /** Incrémenter après un check-in pour recharger les messages proactifs. */
  refreshToken?: number;
};

type StreamEvent =
  | { type: "user"; message: AiCoachMessagePublic }
  | { type: "token"; text: string }
  | { type: "done"; assistantMessage: AiCoachMessagePublic }
  | { type: "error"; error: string; status?: number };

function AnneAvatar() {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1D4D3A]/30 bg-white text-xs font-bold text-[#1D4D3A]"
      aria-hidden
    >
      A
    </span>
  );
}

export function PatientAiCoachPanel({ compact = false, refreshToken = 0 }: Props) {
  const [messages, setMessages] = useState<AiCoachMessagePublic[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
    scrollToBottom();
  }, [messages, streamingText, streaming, scrollToBottom]);

  async function consumeCoachStream(res: Response, optimisticUser: AiCoachMessagePublic) {
    const reader = res.body?.getReader();
    if (!reader) throw new Error("Flux indisponible");

    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        const payload = JSON.parse(line.slice(5).trim()) as StreamEvent;

        if (payload.type === "user") {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== optimisticUser.id),
            payload.message,
          ]);
        } else if (payload.type === "token") {
          accumulated += payload.text;
          setStreamingText(accumulated);
        } else if (payload.type === "done") {
          setMessages((prev) => [...prev, payload.assistantMessage]);
          setStreamingText("");
        } else if (payload.type === "error") {
          throw new Error(payload.error);
        }
      }
    }
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setStreaming(true);
    setError(null);
    setInput("");
    setStreamingText("");

    const optimisticUser: AiCoachMessagePublic = {
      id: `optimistic-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      isProactive: false,
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/patient/weight-program/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Impossible d'envoyer le message.");
      }

      await consumeCoachStream(res, optimisticUser);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setStreamingText("");
      setError(err instanceof Error ? err.message : "Erreur de communication avec Anne.");
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const heightClass = compact ? "max-h-64" : "max-h-[28rem]";

  return (
    <section className={compact ? `${poidsCard} flex flex-col p-5` : `${poidsCard} flex flex-col`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AnneAvatar />
          <div>
            <h2 className={poidsTitle}>Anne — coach santé</h2>
            <p className="text-xs text-slate-500">Assistante IA — pas un avis médical</p>
          </div>
        </div>
        {compact ? (
          <Link
            href="/dashboard/patient/coach-ia"
            className="text-xs font-semibold text-[#1D4D3A] hover:underline"
          >
            Plein écran →
          </Link>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
        <p className="text-xs font-medium text-red-800">Urgence médicale ?</p>
        <a
          href="tel:811"
          className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          Appelez le 811
        </a>
      </div>

      <div
        ref={scrollRef}
        className={`mt-3 flex-1 overflow-y-auto rounded-xl border border-slate-100 bg-[#FAFAF8] p-3 ${heightClass}`}
      >
        {loading ? (
          <DashboardSpinner label="Chargement de la conversation…" />
        ) : messages.length === 0 && !streaming ? (
          <p className={poidsMeta}>
            Anne vous accueillera ici dès que votre programme est actif.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) =>
              m.role === "user" ? (
                <li key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#3EBD93] px-3 py-2 text-sm leading-relaxed text-white">
                    {m.content}
                  </div>
                </li>
              ) : (
                <li key={m.id} className="flex items-end gap-2 justify-start">
                  <AnneAvatar />
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-[#1D4D3A]/25 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm">
                    {m.content}
                  </div>
                </li>
              ),
            )}

            {streaming && streamingText ? (
              <li className="flex items-end gap-2 justify-start">
                <AnneAvatar />
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-[#1D4D3A]/25 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm">
                  {streamingText}
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#1D4D3A]" />
                </div>
              </li>
            ) : null}

            {streaming && !streamingText ? (
              <li className="flex items-center gap-2 text-xs text-[#6B7280]">
                <AnneAvatar />
                <span className="animate-pulse">Anne écrit…</span>
              </li>
            ) : null}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez à Anne… (Entrée pour envoyer)"
          className="min-h-[42px] min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1D4D3A] focus:ring-1 focus:ring-[#1D4D3A]/25"
          disabled={streaming}
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className={`shrink-0 self-end px-5 py-2.5 ${poidsBtnPrimary}`}
        >
          {streaming ? "…" : "Envoyer"}
        </button>
      </form>
    </section>
  );
}
