"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnneCoachCheckInModal } from "@/components/dashboard/patient-space/AnneCoachCheckInModal";
import { AnneWeeklyStatusCard } from "@/components/dashboard/patient-space/AnneWeeklyStatusCard";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";
import { tendancePoids } from "@/lib/coach-weight-trends";
import type { AiCoachMessagePublic } from "@/lib/patient/ai-coach";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";

type StreamEvent =
  | { type: "user"; message: AiCoachMessagePublic }
  | { type: "token"; text: string }
  | { type: "done"; assistantMessage: AiCoachMessagePublic }
  | { type: "error"; error: string; status?: number };

const QUICK_CHIPS = [
  "Je me sens bien 😊",
  "J'ai des nausées",
  "Je veux faire mon bilan hebdomadaire",
  "Question sur ma dose",
  "Parler à mon IPS",
] as const;

const ANNE_CAPABILITIES = [
  "Analyser votre évolution",
  "Gérer les effets secondaires",
  "Préparer vos rapports IPS",
  "Répondre 24 h/24",
] as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

function weekNumber(startDate: string): number {
  const start = new Date(startDate);
  const diff = Date.now() - start.getTime();
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(52, Math.max(1, weeks));
}

function energyDots(level: number | null): string {
  const n = level != null ? Math.round(level) : 0;
  return Array.from({ length: 5 }, (_, i) => (i < n ? "●" : "○")).join("");
}

function AnneAvatar({ size = "md", pulse = false }: { size?: "sm" | "md" | "lg"; pulse?: boolean }) {
  const dim =
    size === "lg" ? "h-12 w-12 text-lg" : size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className="relative shrink-0">
      <span
        className={`flex ${dim} items-center justify-center rounded-full bg-[#1D4D3A] font-bold text-white`}
        aria-hidden
      >
        A
      </span>
      {pulse ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#F7F9F8] bg-emerald-500 animate-pulse"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <AnneAvatar size="sm" />
      <div className="rounded-2xl rounded-tl-sm border border-[#3EBD93]/20 bg-[#F0F7F4] px-4 py-3">
        <div className="flex items-center gap-1" aria-label="Anne écrit…">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-slate-400"
              style={{
                animation: "bounce 1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  program,
  checkIns,
  onCheckIn,
}: {
  program: WeightProgramPublic | null;
  checkIns: WeightCheckInPublic[];
  onCheckIn: () => void;
}) {
  const tendance = tendancePoids(checkIns);
  const lastEnergie = checkIns[0]?.energie ?? tendance.moyenneEnergie;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3">
        <AnneAvatar size="lg" pulse />
        <div>
          <p className="font-bold text-slate-900">Anne</p>
          <p className="text-xs text-emerald-600">En ligne</p>
          <p className="text-xs text-slate-500">Coach IA MedSim · 24 h/24</p>
        </div>
      </div>

      <hr className="my-5 border-gray-100" />

      <AnneWeeklyStatusCard />

      <hr className="my-5 border-gray-100" />

      {program ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
          <p className="font-semibold text-slate-800">📊 Cette semaine</p>
          <dl className="mt-3 space-y-2 text-slate-700">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Poids</dt>
              <dd className="font-medium">{program.currentWeight.toFixed(1)} kg</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Delta</dt>
              <dd className="font-medium">
                {tendance.deltaDernierKg != null
                  ? `${tendance.deltaDernierKg > 0 ? "+" : ""}${tendance.deltaDernierKg} kg ${tendance.deltaDernierKg < 0 ? "↓" : tendance.deltaDernierKg > 0 ? "↑" : ""}`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Énergie</dt>
              <dd className="font-medium tracking-wider text-[#1D4D3A]">
                {energyDots(lastEnergie)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Semaine</dt>
              <dd className="font-medium">
                {weekNumber(program.startDate)}/52
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-slate-500">
          Activez votre programme poids pour voir vos stats ici.
        </p>
      )}

      <button
        type="button"
        onClick={onCheckIn}
        disabled={!program}
        className="mt-4 w-full rounded-xl bg-[#1D4D3A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#163d2e] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Faire mon bilan hebdomadaire
      </button>

      <hr className="my-5 border-gray-100" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ce qu&apos;Anne fait pour vous
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-[#3EBD93]">✓</span>
            Analyse vos bilans hebdomadaires (poids, énergie, sommeil, nausées)
          </li>
          <li className="flex gap-2">
            <span className="text-[#3EBD93]">✓</span>
            Contact proactif chaque lundi à 9 h
          </li>
          <li className="flex gap-2">
            <span className="text-[#3EBD93]">✓</span>
            Rapport hebdo à votre IPS chaque vendredi
          </li>
          <li className="flex gap-2">
            <span className="text-[#3EBD93]">✓</span>
            Escalade automatique si besoin
          </li>
        </ul>
      </div>

      <hr className="my-5 border-gray-100" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ce qu&apos;Anne peut faire
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {ANNE_CAPABILITIES.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[#3EBD93]">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-6">
        <a
          href="tel:811"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          🚨 Urgence → 811
        </a>
      </div>
    </div>
  );
}

type Props = {
  prenom: string;
};

export function AnneCoachChat({ prenom }: Props) {
  void prenom;
  const [messages, setMessages] = useState<AiCoachMessagePublic[]>([]);
  const [program, setProgram] = useState<WeightProgramPublic | null>(null);
  const [checkIns, setCheckIns] = useState<WeightCheckInPublic[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadCoach = useCallback(async () => {
    const res = await fetch("/api/patient/weight-program/coach");
    if (res.ok) {
      const data = (await res.json()) as {
        messages?: AiCoachMessagePublic[];
        program?: WeightProgramPublic | null;
        checkIns?: WeightCheckInPublic[];
      };
      setMessages(data.messages ?? []);
      setProgram(data.program ?? null);
      setCheckIns(data.checkIns ?? []);
      setError(null);
    } else {
      setError("Impossible de charger la conversation.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCoach();
  }, [loadCoach]);

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

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setStreaming(true);
    setError(null);
    setInput("");
    setStreamingText("");

    const optimisticUser: AiCoachMessagePublic = {
      id: `optimistic-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
      isProactive: false,
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/patient/weight-program/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
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

  function handleChip(label: string) {
    if (label === "Je veux faire mon bilan hebdomadaire") {
      setCheckInOpen(true);
      return;
    }
    if (label === "Parler à mon IPS") {
      window.location.href = PATIENT_DASHBOARD_ROUTES.clavardage;
      return;
    }
    void sendMessage(label);
  }

  function handleCheckInSuccess(
    coachMessage: AiCoachMessagePublic | null,
    updatedProgram: WeightProgramPublic | null,
  ) {
    if (updatedProgram) setProgram(updatedProgram);
    void loadCoach();
    if (coachMessage) {
      setMessages((prev) => [...prev, coachMessage]);
    }
  }

  const showChips =
    !loading &&
    messages.length > 0 &&
    messages.length <= 2 &&
    messages.every((m) => m.role === "assistant") &&
    !streaming;

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-white">
      {/* Sidebar desktop */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-gray-100 bg-[#F7F9F8] p-5 lg:flex">
        <SidebarContent
          program={program}
          checkIns={checkIns}
          onCheckIn={() => setCheckInOpen(true)}
        />
      </aside>

      {/* Sidebar mobile drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-gray-100 bg-[#F7F9F8] p-5 shadow-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="mb-4 self-end text-sm text-slate-500"
            >
              Fermer
            </button>
            <SidebarContent
              program={program}
              checkIns={checkIns}
              onCheckIn={() => {
                setSidebarOpen(false);
                setCheckInOpen(true);
              }}
            />
          </aside>
        </div>
      ) : null}

      {/* Chat principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le contexte patient"
          >
            ☰
          </button>
          <Link
            href={PATIENT_DASHBOARD_ROUTES.hub}
            className="text-slate-500 hover:text-slate-800 lg:hidden"
            aria-label="Retour"
          >
            ←
          </Link>
          <AnneAvatar size="sm" pulse />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900">Anne</p>
            <p className="text-xs text-emerald-600">En ligne</p>
          </div>
        </header>

        <p className="shrink-0 border-b border-gray-50 bg-slate-50/80 px-4 py-2 text-center text-[11px] text-slate-500 sm:px-5">
          Anne est une IA — elle ne remplace pas votre IPS
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loading ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />
                <div className="h-24 w-4/5 max-w-md animate-pulse rounded-2xl bg-slate-100" />
              </div>
              <div className="flex justify-end">
                <div className="h-12 w-1/2 max-w-xs animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((m) =>
                m.role === "assistant" ? (
                  <div key={m.id} className="flex items-end gap-2">
                    <AnneAvatar size="sm" />
                    <div>
                      <div className="max-w-[min(100%,28rem)] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-[#3EBD93]/20 bg-[#F0F7F4] px-4 py-3 text-sm leading-relaxed text-[#1A1A2E]">
                        {m.content}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{formatTime(m.createdAt)}</p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col items-end">
                    <div className="max-w-[min(100%,28rem)] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#1D4D3A] px-4 py-3 text-sm leading-relaxed text-white">
                      {m.content}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatTime(m.createdAt)}</p>
                  </div>
                ),
              )}

              {streaming && streamingText ? (
                <div className="flex items-end gap-2">
                  <AnneAvatar size="sm" />
                  <div className="max-w-[min(100%,28rem)] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-[#3EBD93]/20 bg-[#F0F7F4] px-4 py-3 text-sm text-[#1A1A2E]">
                    {streamingText}
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#1D4D3A]" />
                  </div>
                </div>
              ) : null}

              {streaming && !streamingText ? <TypingIndicator /> : null}

              {showChips ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChip(chip)}
                      disabled={streaming}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[#3EBD93] hover:bg-[#F0F7F4] disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <footer className="shrink-0 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {error ? <p className="mb-2 text-center text-xs text-red-600">{error}</p> : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="mx-auto flex max-w-2xl items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder="Écrivez à Anne…"
              disabled={streaming}
              className="min-h-[44px] flex-1 rounded-full border border-gray-200 bg-[#FAFAF8] px-4 text-sm text-slate-800 outline-none transition focus:border-[#1D4D3A] focus:ring-2 focus:ring-[#1D4D3A]/15 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="shrink-0 rounded-full bg-[#1D4D3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163d2e] disabled:opacity-40"
            >
              Envoyer
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-gray-400">
            Anne est une IA — Pour urgences médicales :{" "}
            <a href="tel:811" className="underline">
              811
            </a>
          </p>
        </footer>
      </div>

      <AnneCoachCheckInModal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        defaultWeight={program?.currentWeight}
        onSuccess={handleCheckInSuccess}
      />
    </div>
  );
}
