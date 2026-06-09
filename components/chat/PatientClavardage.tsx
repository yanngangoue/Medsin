"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessagePublic, ChatThreadPublic } from "@/lib/chat/service";
import { isIpsBusinessHours, IPS_RESPONSE_SLA } from "@/lib/chat/business-hours";
import { CHAT_POLL_MS, mergeChatMessages } from "@/components/chat/chat-polling";
import { ChatBubbleList } from "@/components/chat/ChatBubbleList";
import { ChatComposer } from "@/components/chat/ChatComposer";

function ipsInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "IP";
}

export function PatientClavardage() {
  const [ipsThread, setIpsThread] = useState<ChatThreadPublic | null>(null);
  const [ipsAssigned, setIpsAssigned] = useState(false);
  const [messages, setMessages] = useState<ChatMessagePublic[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (threadId: string, replace = false) => {
    const msgRes = await fetch(`/api/chat/threads/${threadId}/messages`);
    if (!msgRes.ok) return;
    const data = (await msgRes.json()) as { messages: ChatMessagePublic[] };
    setMessages((prev) => (replace ? data.messages : mergeChatMessages(prev, data.messages)));
  }, []);

  const loadMeta = useCallback(async () => {
    const threadsRes = await fetch("/api/chat/threads");
    if (!threadsRes.ok) {
      setLoading(false);
      return null;
    }
    const threadsData = (await threadsRes.json()) as {
      threads: ChatThreadPublic[];
      ipsAssigned?: boolean;
      businessHoursOpen?: boolean;
    };
    setIpsAssigned(threadsData.ipsAssigned ?? false);
    setBusinessOpen(threadsData.businessHoursOpen ?? isIpsBusinessHours());
    const thread = threadsData.threads[0] ?? null;
    setIpsThread(thread);
    setLoading(false);
    return thread;
  }, []);

  const loadAll = useCallback(async () => {
    const thread = await loadMeta();
    if (thread) {
      await fetchMessages(thread.id, true);
    } else {
      setMessages([]);
    }
  }, [loadMeta, fetchMessages]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    scrollDown();
  }, [messages]);

  useEffect(() => {
    if (!ipsThread) return;

    const threadId = ipsThread.id;
    const interval = setInterval(() => {
      void fetchMessages(threadId, false);
    }, CHAT_POLL_MS);

    return () => clearInterval(interval);
  }, [ipsThread, fetchMessages]);

  async function startConversation() {
    setStarting(true);
    const res = await fetch("/api/chat/threads", { method: "POST" });
    if (res.ok) {
      const data = (await res.json()) as { thread: ChatThreadPublic };
      setIpsThread(data.thread);
      setIpsAssigned(true);
      await fetchMessages(data.thread.id, true);
    } else {
      await loadMeta();
    }
    setStarting(false);
  }

  async function sendMessage(opts?: { attachmentUrl?: string; attachmentId?: string }) {
    const text = draft.trim();
    if (!ipsThread || sending) return;
    if (!text && !opts?.attachmentId) return;

    setSending(true);
    setDraft("");

    const res = await fetch(`/api/chat/threads/${ipsThread.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        attachmentUrl: opts?.attachmentUrl ?? null,
        attachmentId: opts?.attachmentId ?? null,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as { message: ChatMessagePublic };
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      void fetchMessages(ipsThread.id, false);
    }
    setSending(false);
  }

  const ipsName = ipsThread?.professionalName ?? "votre IPS";

  return (
    <div className="flex h-[min(720px,calc(100dvh-10rem))] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-red-300 bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
        🚨 Urgence médicale ? Composez le{" "}
        <a href="tel:811" className="underline">
          811
        </a>{" "}
        ou le{" "}
        <a href="tel:911" className="underline">
          911
        </a>
      </div>

      <div className="flex items-center gap-3 border-b border-slate-200 bg-[#FAFAF8] px-4 py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-sm font-bold text-[#1D4D3A]">
          {ipsInitials(ipsName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">Votre IPS : {ipsName}</p>
          <p className="text-xs text-slate-500">{IPS_RESPONSE_SLA}</p>
        </div>
        {!businessOpen ? (
          <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
            Hors ligne — répond demain matin
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
            En ligne
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : !ipsThread ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          {ipsAssigned ? (
            <>
              <p className="max-w-sm text-sm text-slate-600">
                Votre IPS est assignée. Démarrez une conversation sécurisée pour vos questions
                cliniques.
              </p>
              <button
                type="button"
                disabled={starting}
                onClick={() => void startConversation()}
                className="rounded-full bg-[#1D4D3A] px-6 py-3 text-sm font-bold text-white hover:bg-[#163d2e] disabled:opacity-50"
              >
                {starting ? "Ouverture…" : "Démarrer une conversation avec mon IPS"}
              </button>
            </>
          ) : (
            <p className="max-w-sm text-sm text-slate-600">
              Votre IPS vous sera assignée après l&apos;examen de votre dossier médical.
            </p>
          )}
        </div>
      ) : (
        <>
          <ChatBubbleList messages={messages} />
          <div ref={bottomRef} />
          <ChatComposer
            draft={draft}
            onDraftChange={setDraft}
            onSend={(opts) => void sendMessage(opts)}
            disabled={sending}
            sending={sending}
            threadId={ipsThread.id}
            placeholder="Message à votre IPS…"
            showSecurityNote
          />
        </>
      )}
    </div>
  );
}
