import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { loadChatAttachmentForUser } from "@/lib/chat/attachments";
import { isDemoMode } from "@/lib/is-demo-mode";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("chat/attachments/[id]/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { id } = await params;
    
      if (isDemoMode() || id === "demo-attachment") {
        return new NextResponse("PDF démo", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        });
      }
    
      const file = await loadChatAttachmentForUser(id, session.user.id, session.user.role);
      if (!file) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      await writeAuditLog({
        userId: session.user.id,
        action: "chat_attachment_downloaded",
        entity: id,
      });
    
      return new NextResponse(new Uint8Array(file.bytes), {
        headers: {
          "Content-Type": file.mimeType,
          "Content-Disposition": `inline; filename="${file.fileName}"`,
          "Cache-Control": "private, no-store",
        },
      });
  });
}
