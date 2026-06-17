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
  /** Pleine hauteur dans les pages messagerie admin/médecin */
  expanded?: boolean;
  /** Masque la bordure externe si le parent fournit déjà un cadre */
  borderless?: boolean;
};

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function MessageThread({
  peerId,
  currentUserId,
  title = "Messagerie",
  expanded = false,
  borderless = false,
}: Props) {
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

  const shellClass = borderless
    ? "flex h-full min-h-0 flex-col"
    : "flex flex-col rounded-2xl border border-slate-200 bg-white";

  const listClass = expanded
    ? "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
    : "flex max-h-72 min-h-48 flex-col gap-3 overflow-y-auto p-4";

  return (
    <div className={shellClass}>
      <div className="shrink-0 border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-[11px] text-slate-500">Actualisation automatique toutes les 30 s</p>
      </div>
      <div className={listClass}>
        {loading ? (
          <p className="text-center text-sm text-slate-500">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Aucun message pour l&apos;instant.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${mine ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-[#16a34a] text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {m.content}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">{formatMessageTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      {error ? <p className="shrink-0 px-4 text-xs text-red-600">{error}</p> : null}
      <form
        onSubmit={(e) => void send(e)}
        className="flex shrink-0 gap-2 border-t border-slate-100 p-3"
      >
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
