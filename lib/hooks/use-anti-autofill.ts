"use client";

import { useCallback, useState } from "react";

/** Empêche le navigateur de préremplir courriel / mot de passe à l’ouverture. */
export function useAntiAutofillGuard() {
  const [unlocked, setUnlocked] = useState(false);
  const unlock = useCallback(() => setUnlocked(true), []);
  return { unlocked, unlock };
}
