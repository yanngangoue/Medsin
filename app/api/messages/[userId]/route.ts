import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { unauthorized, badRequest, forbidden } from "@/lib/api-errors";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("messages/[userId]/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
    
      const { userId: otherId } = await params;
      if (!otherId) return badRequest();
    
      const other = await prisma.user.findUnique({ where: { id: otherId } });
      if (!other) return badRequest("Utilisateur introuvable");
    
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherId },
            { senderId: otherId, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 200,
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          content: true,
          read: true,
          createdAt: true,
        },
      });
    
      if (user.role === "PATIENT" && other.role === "PATIENT") {
        return forbidden();
      }
    
      await prisma.message.updateMany({
        where: { senderId: otherId, receiverId: user.id, read: false },
        data: { read: true },
      });
    
      return NextResponse.json({ messages, peer: { id: other.id, prenom: other.prenom, role: other.role } });
  });
}
