"use client";

import { MessageThread } from "@/components/messages/MessageThread";

type Props = {
  peerId: string;
  currentUserId: string;
  title?: string;
};

export function AdminMessagerie({ peerId, currentUserId, title }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MessageThread peerId={peerId} currentUserId={currentUserId} title={title ?? "Messagerie"} />
    </section>
  );
}
