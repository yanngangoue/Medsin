"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

type Props = {
  peerId: string;
  currentUserId: string;
  title?: string;
};

export function MessageThread({ peerId, currentUserId, title = "Messagerie" }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${encodeURIComponent(peerId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[] };
      setMessages(data.messages ?? []);
      setError(null);
    } catch {
      setError("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }, [peerId]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => clearInterval(id);
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: peerId, content: text }),
      });
      if (!res.ok) {
        setError("Envoi impossible.");
        return;
      }
      setContent("");
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-[11px] text-slate-500">Actualisation automatique toutes les 30 s</p>
      </div>
      <div className="flex max-h-72 min-h-48 flex-col gap-2 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-sm text-slate-500">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Aucun message pour l&apos;instant.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-[#16a34a] text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>
      {error ? <p className="px-4 text-xs text-red-600">{error}</p> : null}
      <form onSubmit={(e) => void send(e)} className="flex gap-2 border-t border-slate-100 p-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Votre message…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
        />
        <Button
          type="submit"
          disabled={sending || !content.trim()}
          className="shrink-0 bg-[#16a34a] hover:bg-green-700"
        >
          Envoyer
        </Button>
      </form>
    </div>
  );
}
