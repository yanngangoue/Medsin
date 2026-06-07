import type { GlpMessageRole } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { encryptMedicalField, decryptMedicalField } from "@/lib/encryption";
import { IPS_AWAY_MESSAGE, isIpsBusinessHours } from "@/lib/chat/business-hours";
import { prisma } from "@/lib/prisma";

export type ChatMessagePublic = {
  id: string;
  senderId: string;
  role: GlpMessageRole;
  content: string;
  isRead: boolean;
  readAt: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  isMine: boolean;
};

export type ChatThreadPublic = {
  id: string;
  subject: string;
  isUrgent: boolean;
  professionalName: string;
  professionalId: string;
  lastMessageAt: string;
  unreadCount: number;
};

function toMessagePublic(
  row: {
    id: string;
    senderId: string;
    role: GlpMessageRole;
    content: string;
    isRead: boolean;
    readAt: Date | null;
    attachmentUrl: string | null;
    createdAt: Date;
  },
  viewerId: string,
): ChatMessagePublic {
  return {
    id: row.id,
    senderId: row.senderId,
    role: row.role,
    content: decryptMedicalField(row.content),
    isRead: row.isRead,
    readAt: row.readAt?.toISOString() ?? null,
    attachmentUrl: row.attachmentUrl,
    createdAt: row.createdAt.toISOString(),
    isMine: row.senderId === viewerId,
  };
}

export async function resolvePatientIpsId(patientId: string): Promise<string | null> {
  const q = await prisma.medicalQuestionnaire.findFirst({
    where: { userId: patientId, ipsId: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { ipsId: true },
  });
  return q?.ipsId ?? null;
}

export async function findPatientIpsThread(patientId: string): Promise<{
  ipsAssigned: boolean;
  thread: ChatThreadPublic | null;
}> {
  const ipsId = await resolvePatientIpsId(patientId);
  if (!ipsId) return { ipsAssigned: false, thread: null };

  const thread = await prisma.chatThread.findFirst({
    where: { patientId, professionalId: ipsId, subject: "ips" },
    include: { professional: { select: { prenom: true, name: true } } },
  });

  if (!thread) return { ipsAssigned: true, thread: null };

  const unreadCount = await prisma.chatMessage.count({
    where: { threadId: thread.id, isRead: false, senderId: { not: patientId } },
  });

  return {
    ipsAssigned: true,
    thread: {
      id: thread.id,
      subject: thread.subject,
      isUrgent: thread.isUrgent,
      professionalName: thread.professional.prenom || thread.professional.name || "IPS",
      professionalId: thread.professionalId,
      lastMessageAt: thread.lastMessageAt.toISOString(),
      unreadCount,
    },
  };
}

export async function getOrCreateIpsThread(patientId: string): Promise<ChatThreadPublic | null> {
  const ipsId = await resolvePatientIpsId(patientId);
  if (!ipsId) return null;

  let thread = await prisma.chatThread.findFirst({
    where: { patientId, professionalId: ipsId, subject: "ips" },
    include: { professional: { select: { prenom: true, name: true } } },
  });

  if (!thread) {
    thread = await prisma.chatThread.create({
      data: {
        patientId,
        professionalId: ipsId,
        subject: "ips",
      },
      include: { professional: { select: { prenom: true, name: true } } },
    });
  }

  const unreadCount = await prisma.chatMessage.count({
    where: { threadId: thread.id, isRead: false, senderId: { not: patientId } },
  });

  return {
    id: thread.id,
    subject: thread.subject,
    isUrgent: thread.isUrgent,
    professionalName: thread.professional.prenom || thread.professional.name || "IPS",
    professionalId: thread.professionalId,
    lastMessageAt: thread.lastMessageAt.toISOString(),
    unreadCount,
  };
}

export async function listThreadsForIps(
  ipsId: string,
  options?: { urgentOnly?: boolean },
): Promise<
  (ChatThreadPublic & {
    patientName: string;
    patientId: string;
    lastMessagePreview: string;
  })[]
> {
  let urgentPatientIds: string[] | null = null;
  if (options?.urgentOnly) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await prisma.weightCheckIn.findMany({
      where: {
        nausee: { gt: 3 },
        recordedAt: { gte: weekAgo },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    urgentPatientIds = rows.map((r) => r.userId);
  }

  const threads = await prisma.chatThread.findMany({
    where: {
      professionalId: ipsId,
      subject: "ips",
      ...(options?.urgentOnly
        ? {
            OR: [
              { isUrgent: true },
              ...(urgentPatientIds && urgentPatientIds.length > 0
                ? [{ patientId: { in: urgentPatientIds } }]
                : []),
            ],
          }
        : {}),
    },
    include: {
      patient: { select: { id: true, prenom: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ isUrgent: "desc" }, { lastMessageAt: "desc" }],
    take: 50,
  });

  const mapped = await Promise.all(
    threads.map(async (t) => {
      const unreadCount = await prisma.chatMessage.count({
        where: { threadId: t.id, isRead: false, senderId: { not: ipsId } },
      });
      const highNausea = urgentPatientIds?.includes(t.patient.id) ?? false;
      const last = t.messages[0];
      let lastMessagePreview = "Aucun message";
      if (last) {
        if (last.attachmentUrl) {
          lastMessagePreview = "📎 Pièce jointe";
        } else {
          const text = decryptMedicalField(last.content);
          lastMessagePreview =
            text.length > 72 ? `${text.slice(0, 72)}…` : text || "Message";
        }
      }

      return {
        id: t.id,
        subject: t.subject,
        isUrgent: t.isUrgent || highNausea,
        professionalName: t.patient.prenom || t.patient.name || "Patient",
        professionalId: t.professionalId,
        patientId: t.patient.id,
        patientName: t.patient.prenom || t.patient.name || "Patient",
        lastMessageAt: t.lastMessageAt.toISOString(),
        lastMessagePreview,
        unreadCount,
      };
    }),
  );

  return mapped.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
}

export async function listThreadMessages(
  threadId: string,
  viewerId: string,
): Promise<ChatMessagePublic[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return rows.map((r) => toMessagePublic(r, viewerId));
}

export async function assertThreadAccess(
  threadId: string,
  userId: string,
  role: string,
): Promise<{ threadId: string; patientId: string; professionalId: string } | null> {
  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread) return null;

  if (role === "PATIENT" && thread.patientId !== userId) return null;
  if ((role === "IPS" || role === "MEDECIN") && thread.professionalId !== userId) return null;
  if (role === "ADMIN") {
    /* ok */
  } else if (role !== "PATIENT" && role !== "IPS" && role !== "MEDECIN") {
    return null;
  }

  return {
    threadId: thread.id,
    patientId: thread.patientId,
    professionalId: thread.professionalId,
  };
}

export async function sendThreadMessage(input: {
  threadId: string;
  senderId: string;
  role: GlpMessageRole;
  content: string;
  attachmentUrl?: string | null;
  attachmentId?: string | null;
}): Promise<ChatMessagePublic> {
  const encrypted = encryptMedicalField(input.content.trim() || "📎 Pièce jointe");

  const row = await prisma.chatMessage.create({
    data: {
      threadId: input.threadId,
      senderId: input.senderId,
      role: input.role,
      content: encrypted,
      attachmentUrl: input.attachmentUrl ?? null,
      attachmentId: input.attachmentId ?? null,
    },
  });

  await prisma.chatThread.update({
    where: { id: input.threadId },
    data: { lastMessageAt: new Date() },
  });

  await writeAuditLog({
    userId: input.senderId,
    action: "chat_message_sent",
    entity: input.threadId,
  });

  return toMessagePublic(row, input.senderId);
}

export async function maybeSendAwayMessage(threadId: string, professionalId: string): Promise<void> {
  if (isIpsBusinessHours()) return;

  const recent = await prisma.chatMessage.findFirst({
    where: { threadId, role: "IPS" },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < 12 * 60 * 60 * 1000) return;

  await sendThreadMessage({
    threadId,
    senderId: professionalId,
    role: "IPS",
    content: IPS_AWAY_MESSAGE,
  });
}

export async function markThreadRead(threadId: string, readerId: string): Promise<void> {
  await prisma.chatMessage.updateMany({
    where: {
      threadId,
      isRead: false,
      senderId: { not: readerId },
    },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function countUnreadMessages(userId: string, role: string): Promise<number> {
  if (role === "PATIENT") {
    return prisma.chatMessage.count({
      where: {
        isRead: false,
        senderId: { not: userId },
        thread: { patientId: userId },
      },
    });
  }
  if (role === "IPS" || role === "MEDECIN") {
    return prisma.chatMessage.count({
      where: {
        isRead: false,
        senderId: { not: userId },
        thread: { professionalId: userId },
      },
    });
  }
  return 0;
}
