import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY?.trim();
  if (!raw || raw.length < 16) {
    throw new Error("ENCRYPTION_KEY manquant ou trop court (min. 16 caractères)");
  }
  return deriveKey(raw);
}

/** Chiffre une chaîne sensible (AES-256-GCM). Format : base64(iv):base64(tag):base64(cipher). */
export function encryptSensitive(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

/** Déchiffre une valeur produite par encryptSensitive. */
export function decryptSensitive(payload: string): string {
  const key = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Format chiffré invalide");
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Chiffre si la clé est configurée ; sinon retourne le texte (mode dev uniquement). */
export function encryptMedicalField(plaintext: string): string {
  if (!process.env.ENCRYPTION_KEY?.trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY requis en production");
    }
    return plaintext;
  }
  return encryptSensitive(plaintext);
}

export function decryptMedicalField(stored: string): string {
  if (!stored.includes(":")) return stored;
  if (!process.env.ENCRYPTION_KEY?.trim()) return stored;
  return decryptSensitive(stored);
}

/** Empreinte pour signature numérique simple d'un PDF ordonnance. */
export function signDocumentDigest(content: string): string {
  const secret = process.env.ENCRYPTION_KEY?.trim() ?? process.env.NEXTAUTH_SECRET ?? "medsim-dev";
  return createHash("sha256").update(`${secret}:${content}`).digest("hex");
}
