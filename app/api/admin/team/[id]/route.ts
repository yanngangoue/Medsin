import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resendStaffInvite } from "@/lib/admin/invite-staff";
import { isDemoMode } from "@/lib/is-demo-mode";
import { isAdminInvitableRole } from "@/lib/admin/staff-roles";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

function appBaseUrl(req: Request): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return catchRouteError("admin/team/[id]/resend-invite", async () => {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { action?: string };
    if (body.action === "deactivate") {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || !isAdminInvitableRole(user.role)) {
        return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
      }
      await prisma.user.update({ where: { id }, data: { isActive: false } });
      await writeAuditLog({
        userId: session.user.id,
        action: "staff_member_deactivated",
        entity: id,
      });
      return NextResponse.json({ ok: true, message: "Compte désactivé." });
    }

    if (body.action === "activate") {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || !isAdminInvitableRole(user.role)) {
        return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
      }
      await prisma.user.update({ where: { id }, data: { isActive: true } });
      await writeAuditLog({
        userId: session.user.id,
        action: "staff_member_activated",
        entity: id,
      });
      return NextResponse.json({ ok: true, message: "Compte réactivé." });
    }

    if (body.action !== "resend-invite") {
      return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({ error: "Indisponible en mode démo" }, { status: 503 });
    }

    try {
      const result = await resendStaffInvite(id, session.user.id, appBaseUrl(req));
      const payload: Record<string, unknown> = {
        ok: true,
        emailSent: result.emailSent,
        inviteUrl: result.inviteUrl,
        message: result.emailSent
          ? "Invitation renvoyée."
          : "Lien régénéré — partagez-le au membre ou configurez RESEND_API_KEY.",
      };
      return NextResponse.json(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  });
}
