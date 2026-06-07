import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { countUnreadMessages } from "@/lib/chat/service";
import { isDemoMode } from "@/lib/is-demo-mode";
import { listCoachMessages } from "@/lib/patient/ai-coach";
import {
  getWeightProgramForUser,
  listCheckIns,
} from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      questionnaire: { status: "APPROVED" as const },
      fulfillment: {
        id: "demo",
        medication: "Ozempic",
        paymentStatus: "PAID" as const,
        status: "IN_PREPARATION" as const,
      },
      tracking: {
        status: "IN_PREPARATION",
        trackingNumber: null,
        trackingUrl: null,
        pdfUrl: null,
      },
      program: null,
      checkIns: [],
      coachMessages: [],
      unreadIps: 0,
    });
  }

  const userId = session.user.id;

  const [questionnaire, fulfillment, program, checkIns, coachMessages, unreadIps] =
    await Promise.all([
      prisma.medicalQuestionnaire.findFirst({
        where: { userId, status: { not: "DRAFT" } },
        orderBy: { updatedAt: "desc" },
        select: { id: true, status: true, updatedAt: true },
      }),
      prisma.medicationFulfillment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          medication: true,
          paymentStatus: true,
          status: true,
          pdfUrl: true,
          trackingNumber: true,
          trackingUrl: true,
        },
      }),
      getWeightProgramForUser(userId),
      listCheckIns(userId, 14),
      listCoachMessages(userId, 30),
      countUnreadMessages(userId, "PATIENT"),
    ]);

  const tracking = fulfillment
    ? {
        status: fulfillment.status,
        trackingNumber: fulfillment.trackingNumber,
        trackingUrl: fulfillment.trackingUrl,
        pdfUrl: fulfillment.pdfUrl,
      }
    : null;

  return NextResponse.json({
    questionnaire,
    fulfillment: fulfillment
      ? {
          id: fulfillment.id,
          medication: fulfillment.medication,
          paymentStatus: fulfillment.paymentStatus,
          status: fulfillment.status,
        }
      : null,
    tracking,
    program,
    checkIns,
    coachMessages,
    unreadIps,
  });
}
