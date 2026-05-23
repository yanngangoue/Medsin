import { NextResponse } from "next/server";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { listAdminConversations } from "@/lib/admin/conversations";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!isStaffRole(user.role)) return forbidden();

  const conversations = await listAdminConversations();

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      ...c,
      lastAt: c.lastAt.toISOString(),
    })),
  });
}
