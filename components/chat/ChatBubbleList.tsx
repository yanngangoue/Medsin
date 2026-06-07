"use client";

import type { ChatMessagePublic } from "@/lib/chat/service";

type Props = {
  messages: ChatMessagePublic[];
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-CA", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";

  return date.toLocaleDateString("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function ChatBubbleList({ messages }: Props) {
  let lastDay: string | null = null;

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
      {messages.map((m) => {
        const day = dayKey(m.createdAt);
        const showDay = day !== lastDay;
        if (showDay) lastDay = day;

        const isMine = m.isMine;
        const time = formatTime(m.createdAt);

        return (
          <div key={m.id}>
            {showDay ? (
              <p className="my-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {formatDayLabel(m.createdAt)}
              </p>
            ) : null}
            <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isMine
                    ? "rounded-br-md bg-[#1D4D3A] text-white"
                    : "rounded-bl-md border border-gray-200 bg-gray-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.attachmentUrl ? (
                  <a
                    href={m.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold underline ${
                      isMine ? "text-white/90" : "text-[#1D4D3A]"
                    }`}
                  >
                    📄 Voir le PDF
                  </a>
                ) : null}
                <div
                  className={`mt-1.5 flex items-center justify-end gap-1.5 text-[10px] ${
                    isMine ? "text-white/75" : "text-slate-500"
                  }`}
                >
                  <span>{time}</span>
                  {isMine && m.isRead ? (
                    <span className="font-medium" aria-label="Lu">
                      Lu ✓✓
                    </span>
                  ) : isMine ? (
                    <span aria-label="Envoyé">✓</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
