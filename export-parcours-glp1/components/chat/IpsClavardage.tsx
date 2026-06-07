"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessagePublic } from "@/lib/chat/service";
import { ChatBubbleList } from "@/components/chat/ChatBubbleList";
import { ChatComposer } from "@/components/chat/ChatComposer";

type ThreadRow = {
  id: string;
  patientId: string;
  patientName: string;
  isUrgent: boolean;
  unreadCount: number;
  lastMessageAt: string;
};

export function IpsClavardage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessagePublic[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadThreads = useCallback(async () => {
    const url = urgentOnly ? "/api/chat/threads?urgent=1" : "/api/chat/threads";
    const res = await fetch(url);
    if (!res.ok) return;
    const data = (await res.json()) as { threads: ThreadRow[] };
    setThreads(data.threads);
    if (!activeId && data.threads[0]) setActiveId(data.threads[0].id);
  }, [urgentOnly, activeId]);

  const loadMessages = useCallback(async (threadId: string) => {
    const res = await fetch(`/api/chat/threads/${threadId}/messages`);
    if (res.ok) {
      const data = (await res.json()) as { messages: ChatMessagePublic[] };
      setMessages(data.messages);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    const es = new EventSource(`/api/chat/threads/${activeId}/stream`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as { messages: ChatMessagePublic[] };
        if (data.messages) setMessages(data.messages);
      } catch {
        /* ping */
      }
    };
    return () => es.close();
  }, [activeId, loadMessages]);

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
      setDraft("");
      await loadMessages(activeId);
      await loadThreads();
    }
  }

  const active = threads.find((t) => t.id === activeId);

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <aside className="flex w-full max-w-xs flex-col border-r border-[#E5E7EB]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-3">
          <p className="text-sm font-semibold text-[#1A1A2E]">Patients</p>
          <label className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
            />
            Urgences
          </label>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`flex w-full items-start justify-between gap-2 px-3 py-3 text-left text-sm hover:bg-[#FAFAF8] ${
                  activeId === t.id ? "bg-[#F0FBF7]" : ""
                }`}
              >
                <span>
                  <span className="font-medium text-[#1A1A2E]">
                    {t.isUrgent ? "🔴 " : ""}
                    {t.patientName}
                  </span>
                </span>
                {t.unreadCount > 0 ? (
                  <span className="rounded-full bg-[#3EBD93] px-2 py-0.5 text-xs font-bold text-white">
                    {t.unreadCount}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-1 flex-col">
        {active ? (
          <p className="border-b border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#1A1A2E]">
            {active.patientName}
            {active.isUrgent ? " — priorité" : ""}
          </p>
        ) : null}
        <ChatBubbleList messages={messages} mode="ips" />
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSend={(opts) => void send(opts)}
          disabled={!activeId || sending}
          sending={sending}
          threadId={activeId}
          placeholder="Réponse IPS…"
        />
      </div>
    </div>
  );
}
