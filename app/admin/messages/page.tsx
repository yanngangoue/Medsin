"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminMessagerie } from "@/components/admin/AdminMessagerie";
import { useSession } from "next-auth/react";

type Conversation = {
  patientId: string;
  patientName: string;
  patientEmail: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
};

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/messages");
    if (res.ok) {
      const data = (await res.json()) as { conversations: Conversation[] };
      setConversations(data.conversations);
      if (!selectedId && data.conversations[0]) {
        setSelectedId(data.conversations[0].patientId);
      }
    }
    setLoading(false);
  }, [selectedId]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => clearInterval(id);
  }, [load]);

  const selected = conversations.find((c) => c.patientId === selectedId);
  const staffId = session?.user?.id ?? "";

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl flex-col px-4 py-6 sm:px-6 md:flex-row md:gap-4">
      <aside className="mb-4 flex max-h-48 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:mb-0 md:max-h-none md:w-80 md:shrink-0">
        <div className="border-b border-slate-100 px-4 py-3">
          <h1 className="font-semibold text-slate-900">Messages</h1>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {loading ? (
            <li className="px-4 py-6 text-sm text-slate-500">Chargement…</li>
          ) : conversations.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">Aucune conversation.</li>
          ) : (
            conversations.map((c) => (
              <li key={c.patientId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.patientId)}
                  className={`w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${
                    selectedId === c.patientId ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{c.patientName}</span>
                    {c.unreadCount > 0 ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{c.lastMessage}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(c.lastAt).toLocaleString("fr-CA")}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        {selected && staffId ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-slate-900">{selected.patientName}</p>
              <Link
                href={`/admin/patients/${selected.patientId}`}
                className="text-sm text-[#16a34a] hover:underline"
              >
                Ouvrir le dossier
              </Link>
            </div>
            <div className="min-h-0 flex-1">
              <AdminMessagerie
                peerId={selected.patientId}
                currentUserId={staffId}
                title={selected.patientName}
              />
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            Sélectionnez une conversation.
          </p>
        )}
      </div>
    </div>
  );
}
