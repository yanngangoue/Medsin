import { auth } from "@/auth";
import { assertThreadAccess, listThreadMessages } from "@/lib/chat/service";
import { isDemoMode } from "@/lib/is-demo-mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** SSE — polling serveur toutes les 5 s pour nouveaux messages. */
export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }

  const { id } = await params;

  if (isDemoMode()) {
    return new Response("data: []\n\n", {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const access = await assertThreadAccess(id, session.user.id, session.user.role);
  if (!access) {
    return new Response("Accès refusé", { status: 403 });
  }

  const encoder = new TextEncoder();
  let lastCount = 0;
  let closed = false;

  req.signal.addEventListener("abort", () => {
    closed = true;
  });

  const stream = new ReadableStream({
    async start(controller) {
      const push = async () => {
        if (closed) return;
        const messages = await listThreadMessages(id, session.user!.id!);
        if (messages.length !== lastCount) {
          lastCount = messages.length;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ messages })}\n\n`),
          );
        } else {
          controller.enqueue(encoder.encode(": ping\n\n"));
        }
      };

      await push();
      const interval = setInterval(() => {
        void push();
      }, 5000);

      req.signal.addEventListener("abort", () => clearInterval(interval));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
