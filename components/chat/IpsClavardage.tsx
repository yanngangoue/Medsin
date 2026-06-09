"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessagePublic } from "@/lib/chat/service";
import { CHAT_POLL_MS, mergeChatMessages } from "@/components/chat/chat-polling";
import { ChatBubbleList } from "@/components/chat/ChatBubbleList";
import { ChatComposer } from "@/components/chat/ChatComposer";

type ThreadRow = {
  id: string;
  patientId: string;
  patientName: string;
  isUrgent: boolean;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
};

const QUICK_TEMPLATES = [
  "Je prends note, je vous réponds sous 24 h",
  "Veuillez appeler le 811 pour ce symptôme",
  "Votre dose sera ajustée au prochain renouvellement",
  "Rapport Anne reçu — tout semble normal",
] as const;

function sortThreads(threads: ThreadRow[]): ThreadRow[] {
  return [...threads].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
}

function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

function formatThreadTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
}

export function IpsClavardage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessagePublic[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    const url = urgentOnly ? "/api/chat/threads?urgent=1" : "/api/chat/threads";
    const res = await fetch(url);
    if (!res.ok) return;
    const data = (await res.json()) as { threads: ThreadRow[] };
    const sorted = sortThreads(data.threads);
    setThreads(sorted);
    setActiveId((current) => {
      if (current && sorted.some((t) => t.id === current)) return current;
      return sorted[0]?.id ?? null;
    });
  }, [urgentOnly]);

  const loadMessages = useCallback(async (threadId: string, replace = false) => {
    const res = await fetch(`/api/chat/threads/${threadId}/messages`);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: ChatMessagePublic[] };
    setMessages((prev) => (replace ? data.messages : mergeChatMessages(prev, data.messages)));
  }, []);

  useEffect(() => {
    void loadThreads();
    const interval = setInterval(() => void loadThreads(), CHAT_POLL_MS);
    return () => clearInterval(interval);
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    void loadMessages(activeId, true);

    const interval = setInterval(() => {
      void loadMessages(activeId, false);
    }, CHAT_POLL_MS);

    return () => clearInterval(interval);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(opts?: { attachmentUrl?: string; attachmentId?: string }) {
    if (!activeId || sending) return;
    const text = draft.trim();
    if (!text && !opts?.attachmentId) return;

    setSending(true);
    const res = await fetch(`/api/chat/threads/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        attachmentUrl: opts?.attachmentUrl ?? null,
        attachmentId: opts?.attachmentId ?? null,
      }),
    });
    setSending(false);

    if (res.ok) {
      const data = (await res.json()) as { message: ChatMessagePublic };
      setDraft("");
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      await loadThreads();
    }
  }

  function applyTemplate(text: string) {
    setDraft(text);
  }

  const active = threads.find((t) => t.id === activeId);

  return (
    <div className="flex h-[min(760px,calc(100dvh-8rem))] min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">Patients</p>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
            />
            Urgent
          </label>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <li className="p-6 text-center text-xs text-slate-500">
              {urgentOnly ? "Aucun dossier urgent." : "Aucune conversation."}
            </li>
          ) : null}
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`flex w-full gap-3 border-b border-slate-100 px-3 py-3 text-left transition hover:bg-slate-50 ${
                  activeId === t.id ? "bg-[#F0F7F4]" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-xs font-bold text-[#1D4D3A]">
                  {patientInitials(t.patientName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-slate-900">{t.patientName}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {formatThreadTime(t.lastMessageAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className="line-clamp-1 text-xs text-slate-500">
                      {t.lastMessagePreview}
                    </span>
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {t.isUrgent ? (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                        Urgent
                      </span>
                    ) : null}
                    {t.unreadCount > 0 ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {t.unreadCount} non lu{t.unreadCount > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {active ? (
          <div className="flex items-center gap-3 border-b border-slate-200 bg-[#FAFAF8] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-xs font-bold text-[#1D4D3A]">
              {patientInitials(active.patientName)}
            </span>
            <div>
              <p className="font-bold text-slate-900">{active.patientName}</p>
              {active.isUrgent ? (
                <p className="text-xs font-medium text-orange-700">Alerte Anne — priorité</p>
              ) : (
                <p className="text-xs text-slate-500">Messagerie sécurisée Loi 25</p>
              )}
            </div>
          </div>
        ) : (
          <p className="border-b border-slate-200 px-4 py-4 text-sm text-slate-500">
            Sélectionnez un patient
          </p>
        )}

        {activeId ? (
          <>
            <ChatBubbleList messages={messages} />
            <div ref={bottomRef} />

            <div className="border-t border-slate-100 bg-[#FAFAF8] px-4 py-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Réponses rapides
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#1D4D3A] hover:bg-white"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            <ChatComposer
              draft={draft}
              onDraftChange={setDraft}
              onSend={(opts) => void send(opts)}
              disabled={!activeId || sending}
              sending={sending}
              threadId={activeId}
              placeholder="Réponse IPS…"
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Choisissez une conversation à gauche
          </div>
        )}
      </div>
    </div>
  );
}
