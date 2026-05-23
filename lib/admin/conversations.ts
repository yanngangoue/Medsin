import { prisma } from "@/lib/prisma";

export type AdminConversation = {
  patientId: string;
  patientName: string;
  patientEmail: string;
  lastMessage: string;
  lastAt: Date;
  unreadCount: number;
};

export async function listAdminConversations(): Promise<AdminConversation[]> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          sender: { role: "PATIENT" },
          receiver: { role: { in: ["MEDECIN", "ADMIN"] } },
        },
        {
          sender: { role: { in: ["MEDECIN", "ADMIN"] } },
          receiver: { role: "PATIENT" },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      read: true,
      senderId: true,
      receiverId: true,
      sender: { select: { id: true, role: true, prenom: true, name: true, email: true } },
      receiver: { select: { id: true, role: true, prenom: true, name: true, email: true } },
    },
  });

  const map = new Map<string, AdminConversation>();

  for (const m of messages) {
    const patient =
      m.sender.role === "PATIENT"
        ? m.sender
        : m.receiver.role === "PATIENT"
          ? m.receiver
          : null;
    if (!patient) continue;

    const existing = map.get(patient.id);
    const unreadFromPatient =
      m.sender.role === "PATIENT" && !m.read ? 1 : 0;

    if (!existing) {
      map.set(patient.id, {
        patientId: patient.id,
        patientName: patient.prenom || patient.name || patient.email,
        patientEmail: patient.email,
        lastMessage: m.content,
        lastAt: m.createdAt,
        unreadCount: unreadFromPatient,
      });
    } else {
      existing.unreadCount += unreadFromPatient;
    }
  }

  return [...map.values()].sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}
