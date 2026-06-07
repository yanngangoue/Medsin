import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { countUnreadMessages } from "@/lib/chat/service";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ count: 0 });
  }

  const count = await countUnreadMessages(session.user.id, session.user.role);
  return NextResponse.json({ count });
}
