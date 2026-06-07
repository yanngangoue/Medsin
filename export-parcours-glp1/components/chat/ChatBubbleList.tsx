"use client";

import type { ChatMessagePublic } from "@/lib/chat/service";

type CoachMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Props = {
  messages: ChatMessagePublic[] | CoachMessage[];
  mode: "ips" | "coach";
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-CA", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function ChatBubbleList({ messages, mode }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
      {messages.map((m) => {
        const isCoach = mode === "coach";
        const isMine = isCoach
          ? (m as CoachMessage).role === "user"
          : (m as ChatMessagePublic).isMine;
        const content = m.content;
        const time = formatTime(m.createdAt);
        const read = !isCoach && (m as ChatMessagePublic).isRead;

        return (
          <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                isMine
                  ? "rounded-br-md bg-[#3EBD93] text-white"
                  : "rounded-bl-md border border-[#E5E7EB] bg-white text-[#1A1A2E]"
              }`}
            >
              <p className="whitespace-pre-wrap">{content}</p>
              {!isCoach && (m as ChatMessagePublic).attachmentUrl ? (
                <a
                  href={(m as ChatMessagePublic).attachmentUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold underline ${
                    isMine ? "text-white" : "text-[#1D4D3A]"
                  }`}
                >
                  📄 Voir le PDF
                </a>
              ) : null}
              <div
                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                  isMine ? "text-white/80" : "text-[#6B7280]"
                }`}
              >
                <span>{time}</span>
                {isMine && mode === "ips" ? (
                  <span aria-label={read ? "Lu" : "Envoyé"}>{read ? "✓✓" : "✓"}</span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
