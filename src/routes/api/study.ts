import { createFileRoute } from "@tanstack/react-router";
import { streamStudyAnswer, aiErrorResponse } from "@/services/geminiService.server";

export const Route = createFileRoute("/api/study")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { passage?: string; messages?: { role: string; content: string }[] } | null;
        const messages = (body?.messages ?? [])
          .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-12)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));
        if (!messages.length) return new Response(JSON.stringify({ error: "Ask a question first." }), { status: 400 });
        try {
          const result = streamStudyAnswer({ messages, passage: String(body?.passage ?? ""), signal: request.signal });
          return result.toTextStreamResponse({ headers: { "Cache-Control": "no-cache, no-transform" } });
        } catch (e) {
          return aiErrorResponse(e);
        }
      },
    },
  },
});
