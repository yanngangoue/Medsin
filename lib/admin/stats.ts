import { prisma } from "@/lib/prisma";
import { buildAdminPatientsWhere } from "@/lib/admin/patient-filters";

export async function getAdminStats() {
  const reviewWhere = buildAdminPatientsWhere(null, "a_revoir", false);

  const [totalPatients, eligible, pendingReview, unreadMessages] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.patientProfile.count({ where: { eligibility: "ELIGIBLE" } }),
    prisma.user.count({ where: reviewWhere }),
    prisma.message.count({
      where: {
        read: false,
        receiver: { role: { in: ["MEDECIN", "ADMIN"] } },
        sender: { role: "PATIENT" },
      },
    }),
  ]);

  return { totalPatients, eligible, pendingReview, unreadMessages };
}

export async function getRecentPatients(limit = 5) {
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      prenom: true,
      name: true,
      email: true,
      createdAt: true,
      profile: { select: { eligibility: true, bmi: true } },
    },
  });

  return patients.map((p) => ({
    id: p.id,
    name: p.prenom || p.name || "—",
    email: p.email,
    createdAt: p.createdAt,
    bmi: p.profile?.bmi ?? null,
    eligibility: p.profile?.eligibility ?? ("PENDING" as const),
  }));
}

export async function getRecentUnreadMessages(limit = 5) {
  const messages = await prisma.message.findMany({
    where: {
      read: false,
      receiver: { role: { in: ["MEDECIN", "ADMIN"] } },
      sender: { role: "PATIENT" },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: { id: true, prenom: true, name: true, email: true } },
    },
  });

  return messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    patient: {
      id: m.sender.id,
      name: m.sender.prenom || m.sender.name || m.sender.email,
    },
  }));
}
