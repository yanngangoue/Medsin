import { API_ERROR_CODES, apiError } from "@/lib/api/api-error";

/** Enveloppe un handler API pour renvoyer 500 au lieu d'une exception non gérée. */
export async function catchRouteError(
  label: string,
  handler: () => Promise<Response | undefined>,
): Promise<Response> {
  try {
    const result = await handler();
    if (result === undefined) {
      console.error(`[api/${label}] handler returned undefined`);
      return apiError(
        500,
        API_ERROR_CODES.INTERNAL_ERROR,
        "Erreur serveur. Réessayez plus tard.",
      );
    }
    return result;
  } catch (error: unknown) {
    console.error(`[api/${label}]`, error);
    return apiError(
      500,
      API_ERROR_CODES.INTERNAL_ERROR,
      "Erreur serveur. Réessayez plus tard.",
    );
  }
}
