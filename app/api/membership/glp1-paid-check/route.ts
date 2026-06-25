import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasActiveGlp1Membership } from "@/lib/membership/glp1-membership";

/** Vérification serveur du statut Glp1Membership (utilisée par le middleware Edge). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ paid: false }, { status: 401 });
  }
  const paid = await hasActiveGlp1Membership(session.user.id);
  return NextResponse.json({ paid });
}
