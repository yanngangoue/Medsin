import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * MVP : le temps réel est géré par polling client (5 s) sur
 * GET /api/chat/threads/[id]/messages — cette route n'est plus utilisée.
 */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  return NextResponse.json(
    {
      deprecated: true,
      threadId: id,
      message:
        "Utilisez GET /api/chat/threads/[id]/messages avec un intervalle de 5 secondes côté client.",
    },
    { status: 410 },
  );
}
