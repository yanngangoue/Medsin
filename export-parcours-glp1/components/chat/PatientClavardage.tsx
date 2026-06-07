"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessagePublic, ChatThreadPublic } from "@/lib/chat/service";
import { ChatBubbleList } from "@/components/chat/ChatBubbleList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { COACH_INTRO, COACH_NAME } from "@/lib/coach-brand";

type CoachMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Tab = "coach" | "ips";

export function PatientClavardage() {
  const [tab, setTab] = useState<Tab>("coach");
  const [ipsThread, setIpsThread] = useState<ChatThreadPublic | null>(null);
  const [ipsMessages, setIpsMessages] = useState<ChatMessagePublic[]>([]);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [responseSla, setResponseSla] = useState("Répond généralement en moins de 24 h");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadCoach = useCallback(async () => {
    const res = await fetch("/api/patient/weight-program/coach");
    if (res.ok) {
      const data = (await res.json()) as { messages: CoachMessage[] };
      setCoachMessages(data.messages);
    }
  }, []);

  const loadIps = useCallback(async () => {
    const threadsRes = await fetch("/api/chat/threads");
    if (!threadsRes.ok) return;
    const threadsData = (await threadsRes.json()) as {
      threads: ChatThreadPublic[];
      responseSla?: string;
    };
    setResponseSla(threadsData.responseSla ?? responseSla);
    const thread = threadsData.threads[0] ?? null;
    setIpsThread(thread);
    if (!thread) return;

    const msgRes = await fetch(`/api/chat/threads/${thread.id}/messages`);
    if (msgRes.ok) {
      const data = (await msgRes.json()) as { messages: ChatMessagePublic[] };
      setIpsMessages(data.messages);
    }
  }, [responseSla]);

  useEffect(() => {
    void loadCoach();
    void loadIps();
  }, [loadCoach, loadIps]);

  useEffect(() => {
    scrollDown();
  }, [ipsMessages, coachMessages, tab]);

  useEffect(() => {
    if (tab !== "ips" || !ipsThread) return;

    const es = new EventSource(`/api/chat/threads/${ipsThread.id}/stream`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as { messages: ChatMessagePublic[] };
        if (data.messages) setIpsMessages(data.messages);
      } catch {
        /* ping */
      }
    };
    return () => es.close();
  }, [tab, ipsThread]);

  async function sendIps(opts?: { attachmentUrl?: string; attachmentId?: string }) {
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
      setIpsMessages((prev) => [...prev, data.message]);
    }
    setSending(false);
  }

  async function sendCoach() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    const res = await fetch("/api/patient/weight-program/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (res.ok) await loadCoach();
    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab("coach")}
          className={`flex-1 px-4 py-3 text-sm font-semibold ${
            tab === "coach" ? "border-b-2 border-[#3EBD93] text-[#1D4D3A]" : "text-[#6B7280]"
          }`}
        >
          {COACH_NAME}
        </button>
        <button
          type="button"
          onClick={() => setTab("ips")}
          className={`flex-1 px-4 py-3 text-sm font-semibold ${
            tab === "ips" ? "border-b-2 border-[#3EBD93] text-[#1D4D3A]" : "text-[#6B7280]"
          }`}
        >
          {ipsThread ? ipsThread.professionalName : "Mon IPS"}
        </button>
      </div>

      {tab === "ips" ? (
        <p className="border-b border-[#E5E7EB] bg-[#F0FBF7] px-4 py-2 text-xs text-[#1D4D3A]">
          {responseSla}
        </p>
      ) : (
        <p className="border-b border-[#E5E7EB] bg-[#F0FBF7] px-4 py-2 text-xs text-[#1D4D3A]">
          {COACH_INTRO} Disponible 24 h/24.
        </p>
      )}

      {tab === "ips" && !ipsThread ? (
        <p className="flex flex-1 items-center justify-center p-6 text-center text-sm text-[#6B7280]">
          Votre IPS vous sera assignée après l&apos;examen de votre dossier médical.
        </p>
      ) : (
        <>
          <ChatBubbleList
            messages={tab === "coach" ? coachMessages : ipsMessages}
            mode={tab}
          />
          <div ref={bottomRef} />
        </>
      )}

      {tab === "coach" ? (
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => void sendCoach()}
          disabled={sending}
          sending={sending}
        />
      ) : (
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSend={(opts) => void sendIps(opts)}
          disabled={!ipsThread || sending}
          sending={sending}
          threadId={ipsThread?.id}
        />
      )}
    </div>
  );
}
