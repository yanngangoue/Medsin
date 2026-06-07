import { encryptMedicalField, decryptMedicalField } from "@/lib/encryption";
import { assertThreadAccess } from "@/lib/chat/service";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;

export async function saveChatAttachment(input: {
  threadId: string;
  uploaderId: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<string> {
  if (input.bytes.length > MAX_BYTES) {
    throw new Error("Fichier trop volumineux (max 5 Mo)");
  }
  if (input.mimeType !== "application/pdf") {
    throw new Error("Seuls les PDF sont acceptés");
  }

  const contentEnc = encryptMedicalField(input.bytes.toString("base64"));

  const row = await prisma.chatAttachment.create({
    data: {
      threadId: input.threadId,
      uploaderId: input.uploaderId,
      fileName: input.fileName.slice(0, 200),
      mimeType: input.mimeType,
      contentEnc,
    },
  });

  return row.id;
}

export async function loadChatAttachmentForUser(
  attachmentId: string,
  userId: string,
  role: string,
): Promise<{ fileName: string; mimeType: string; bytes: Buffer } | null> {
  const row = await prisma.chatAttachment.findUnique({
    where: { id: attachmentId },
  });
  if (!row) return null;

  const access = await assertThreadAccess(row.threadId, userId, role);
  if (!access) return null;

  const b64 = decryptMedicalField(row.contentEnc);
  return {
    fileName: row.fileName,
    mimeType: row.mimeType,
    bytes: Buffer.from(b64, "base64"),
  };
}
