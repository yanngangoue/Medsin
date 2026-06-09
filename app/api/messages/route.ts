import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { unauthorized, badRequest, forbidden } from "@/lib/api-errors";
import { sendMessageSchema } from "@/lib/schemas/message";

export async function POST(req: Request) {
  return catchRouteError("messages/POST", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
    
      const body = await req.json().catch(() => null);
      const parsed = sendMessageSchema.safeParse(body);
      if (!parsed.success) return badRequest();
    
      const { receiverId, content } = parsed.data;
      if (receiverId === user.id) return badRequest("Destinataire invalide");
    
      const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
      if (!receiver) return badRequest("Utilisateur introuvable");
    
      if (user.role === "PATIENT" && receiver.role === "PATIENT") {
        return forbidden();
      }
    
      const message = await prisma.message.create({
        data: {
          senderId: user.id,
          receiverId,
          content: content.trim(),
        },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          content: true,
          read: true,
          createdAt: true,
        },
      });
    
      return NextResponse.json({ message }, { status: 201 });
  });
}
