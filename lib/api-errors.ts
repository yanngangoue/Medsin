import { API_ERROR_CODES, apiError } from "@/lib/api/api-error";

export function unauthorized() {
  return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Non authentifié");
}

export function forbidden() {
  return apiError(403, API_ERROR_CODES.FORBIDDEN, "Accès refusé");
}

export function badRequest(message = "Données invalides") {
  return apiError(400, API_ERROR_CODES.VALIDATION_ERROR, message);
}
