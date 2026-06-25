import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { createStaffMember, listStaffMembers } from "@/lib/admin/invite-staff";
import { proposeStaffEmail, staffEmailDomain } from "@/lib/admin/staff-email";
import { isDemoMode } from "@/lib/is-demo-mode";
import { createStaffMemberSchema } from "@/lib/schemas/admin-team";

function appBaseUrl(req: Request): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin
  );
}

function requireAdmin(session: Session | null) {
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs", code: "FORBIDDEN" },
      { status: 403 },
    );
  }
  return null;
}

export async function GET(req: Request) {
  return catchRouteError("admin/team/GET", async () => {
    const session = await auth();
    const denied = requireAdmin(session);
    if (denied) return denied;

    const url = new URL(req.url);
    const propose = url.searchParams.get("propose");
    if (propose === "email") {
      const prenom = url.searchParams.get("prenom") ?? "";
      const nom = url.searchParams.get("nom") ?? "";
      return NextResponse.json({
        email: proposeStaffEmail(prenom, nom),
        domain: staffEmailDomain(),
      });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        members: [],
        emailDomain: staffEmailDomain(),
      });
    }

    return NextResponse.json(await listStaffMembers());
  });
}

export async function POST(req: Request) {
  return catchRouteError("admin/team/POST", async () => {
    const session = await auth();
    const denied = requireAdmin(session);
    if (denied) return denied;

    const body: unknown = await req.json().catch(() => null);
    const parsed = createStaffMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (isDemoMode()) {
      return NextResponse.json(
        { error: "Création d'équipe indisponible en mode démo sans base de données." },
        { status: 503 },
      );
    }

    try {
      const adminId = session?.user?.id;
      if (!adminId) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
      const result = await createStaffMember(
        parsed.data,
        adminId,
        appBaseUrl(req),
      );
      const payload: Record<string, unknown> = {
        member: result.member,
        emailSent: result.emailSent,
        message: result.emailSent
          ? "Compte créé — identifiants envoyés par courriel. Le membre devra changer son mot de passe à la première connexion."
          : "Compte créé. Configurez RESEND_API_KEY pour envoyer les identifiants automatiquement.",
      };
      return NextResponse.json(payload, { status: 201 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Création impossible";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  });
}
