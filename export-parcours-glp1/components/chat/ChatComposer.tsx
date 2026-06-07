"use client";

import { useRef } from "react";

type Props = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (opts?: { attachmentUrl?: string; attachmentId?: string }) => void;
  disabled?: boolean;
  sending?: boolean;
  threadId?: string | null;
  placeholder?: string;
};

export function ChatComposer({
  draft,
  onDraftChange,
  onSend,
  disabled = false,
  sending = false,
  threadId,
  placeholder = "Écrivez votre message…",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadPdf(file: File) {
    if (!threadId) return;
    const form = new FormData();
    form.set("threadId", threadId);
    form.set("file", file);
    const res = await fetch("/api/chat/upload", { method: "POST", body: form });
    if (!res.ok) return;
    const data = (await res.json()) as { attachmentId: string; attachmentUrl: string };
    onSend({
      attachmentId: data.attachmentId,
      attachmentUrl: data.attachmentUrl,
    });
  }

  return (
    <div className="flex items-center gap-2 border-t border-[#E5E7EB] p-3">
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadPdf(file);
          e.target.value = "";
        }}
      />
      {threadId ? (
        <button
          type="button"
          disabled={disabled || sending}
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-lg"
          title="Joindre un PDF (résultats de labo)"
          aria-label="Joindre un PDF"
        >
          📎
        </button>
      ) : null}
      <input
        type="text"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (draft.trim()) onSend();
          }
        }}
        placeholder={placeholder}
        disabled={disabled || sending}
        className="min-w-0 flex-1 rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-[#3EBD93]"
      />
      <button
        type="button"
        onClick={() => onSend()}
        disabled={disabled || sending || !draft.trim()}
        className="shrink-0 rounded-full bg-[#3EBD93] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        Envoyer
      </button>
    </div>
  );
}
