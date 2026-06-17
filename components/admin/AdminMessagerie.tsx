"use client";

import { MessageThread } from "@/components/messages/MessageThread";

type Props = {
  peerId: string;
  currentUserId: string;
  title?: string;
};

export function AdminMessagerie({ peerId, currentUserId, title }: Props) {
  return (
    <section className="flex h-full min-h-[20rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:min-h-0">
      <MessageThread
        peerId={peerId}
        currentUserId={currentUserId}
        title={title ?? "Messagerie"}
        expanded
        borderless
      />
    </section>
  );
}
