"use client";

import { useEffect, useState } from "react";

export function useUnreadChatCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch("/api/chat/unread-count");
      if (!cancelled && res.ok) {
        const data = (await res.json()) as { count: number };
        setCount(data.count);
      }
    }

    void load();
    const interval = setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return count;
}
