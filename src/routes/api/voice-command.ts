import { createFileRoute } from "@tanstack/react-router";
import { parseVoiceCommand, aiErrorResponse } from "@/services/geminiService.server";
import { BOOKS } from "@/data/books";

export const Route = createFileRoute("/api/voice-command")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { transcript?: string } | null;
        const transcript = String(body?.transcript ?? "").trim();
        if (!transcript) return Response.json({ error: "Nothing was heard." }, { status: 400 });
        try {
          const cmd = await parseVoiceCommand(transcript, BOOKS.map((b) => b.id));
          if (cmd.bookId && cmd.chapter) {
            const max = BOOKS.find((b) => b.id === cmd.bookId)?.chapters ?? 1;
            cmd.chapter = Math.min(cmd.chapter, max);
          }
          return Response.json(cmd);
        } catch (e) {
          return aiErrorResponse(e);
        }
      },
    },
  },
});
