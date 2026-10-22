// src/app/api/learning/explainer/orchestrate/route.ts
/**
 * SSE proxy for POST /learning/explainer/orchestrate-stream.
 * The browser only talks to this same-origin Route Handler; the real backend
 * URL stays server-side. Upstream text/event-stream is relayed untouched.
 */
import { OrchestratorRequestSchema } from "@/features/learning/explainer/types";
import { explainerApiUrl, explainerApiHeaders } from "@/features/learning/explainer/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = OrchestratorRequestSchema.parse(await request.json());
  } catch {
    return Response.json(
      { event: "error", data: "Invalid request body." },
      { status: 400 }
    );
  }

  const upstream = await fetch(explainerApiUrl("orchestrate-stream"), {
    method: "POST",
    headers: explainerApiHeaders(),
    body: JSON.stringify(payload),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "Upstream service error");
    return Response.json(
      { event: "error", data: detail },
      { status: upstream.status || 502 }
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
