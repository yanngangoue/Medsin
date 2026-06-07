import { decryptMedicalField, encryptMedicalField } from "@/lib/encryption";

export function encryptPharmacyApiKey(apiKey: string): string {
  return encryptMedicalField(apiKey);
}

export function decryptPharmacyApiKey(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  return decryptMedicalField(stored);
}
