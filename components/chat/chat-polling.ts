import type { ChatMessagePublic } from "@/lib/chat/service";

export const CHAT_POLL_MS = 5000;

/** Fusionne les nouveaux messages sans recharger toute la liste. */
export function mergeChatMessages(
  prev: ChatMessagePublic[],
  next: ChatMessagePublic[],
): ChatMessagePublic[] {
  if (next.length === 0) return prev;
  if (prev.length === 0) return next;

  const prevLastId = prev[prev.length - 1]?.id;
  const nextLastId = next[next.length - 1]?.id;

  if (prev.length === next.length && prevLastId === nextLastId) {
    return prev.map((m, i) => {
      const n = next[i];
      if (!n) return m;
      if (n.isRead !== m.isRead || n.readAt !== m.readAt) return n;
      return m;
    });
  }

  const known = new Set(prev.map((m) => m.id));
  const added = next.filter((m) => !known.has(m.id));
  if (added.length > 0) return [...prev, ...added];
  return next.length > prev.length ? next : prev;
}
