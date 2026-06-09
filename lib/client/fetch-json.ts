/** Message utilisateur par défaut si la réponse n'est pas du JSON ou sans message. */
export const FETCH_ERROR_FALLBACK =
  "Impossible de charger les données. Vérifiez votre connexion et réessayez.";

export type FetchJsonError = Error & { status?: number; code?: string };

/** fetch JSON avec message d'erreur en français pour l'UI. */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    const err = new Error(FETCH_ERROR_FALLBACK) as FetchJsonError;
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };

  if (!res.ok) {
    const err = new Error(data.error ?? FETCH_ERROR_FALLBACK) as FetchJsonError;
    err.status = res.status;
    err.code = data.code;
    throw err;
  }

  return data as T;
}

/** Extrait un message lisible pour l'utilisateur depuis une erreur inconnue. */
export function userFacingErrorMessage(error: unknown, fallback = FETCH_ERROR_FALLBACK): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
