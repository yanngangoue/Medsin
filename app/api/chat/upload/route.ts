import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { saveChatAttachment } from "@/lib/chat/attachments";
import { assertThreadAccess } from "@/lib/chat/service";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function POST(req: Request) {
  return catchRouteError("chat/upload/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const form = await req.formData().catch(() => null);
      if (!form) {
        return NextResponse.json({ error: "Formulaire invalide", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      const threadId = String(form.get("threadId") ?? "");
      const file = form.get("file");
    
      if (!threadId || !(file instanceof File)) {
        return NextResponse.json({ error: "threadId et fichier PDF requis", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({
          attachmentId: "demo-attachment",
          attachmentUrl: "/api/chat/attachments/demo-attachment",
        });
      }
    
      const access = await assertThreadAccess(threadId, session.user.id, session.user.role);
      if (!access) {
        return NextResponse.json({ error: "Accès refusé", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const bytes = Buffer.from(await file.arrayBuffer());
    
      try {
        const attachmentId = await saveChatAttachment({
          threadId,
          uploaderId: session.user.id,
          fileName: file.name || "resultat-labo.pdf",
          mimeType: file.type || "application/pdf",
          bytes,
        });
    
        await writeAuditLog({
          userId: session.user.id,
          action: "chat_attachment_uploaded",
          entity: attachmentId,
        });
    
        return NextResponse.json({
          attachmentId,
          attachmentUrl: `/api/chat/attachments/${attachmentId}`,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Téléversement échoué";
        return NextResponse.json({ error: message }, { status: 400 });
      }
  });
}
