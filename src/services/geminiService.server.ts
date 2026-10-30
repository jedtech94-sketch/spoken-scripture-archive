// Server-only: Gemini via Lovable AI Gateway. Key never leaves the server.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

export const GEMINI_MODEL = "google/gemini-3.5-flash";

function provider() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured.");
  const runId = createLovableAiGatewayRunIdFetch();
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runId.fetch,
  });
}

const STUDY_SYSTEM = `You are a warm, scholarly Bible study companion inside the Chikuni Study Bible, which includes the 66-book canon plus the Ethiopian Orthodox Tewahedo deuterocanon (1 Enoch, Jubilees, Meqabyan, 4 Baruch, 4 Ezra, etc.).
Answer questions about the passage the reader has open. Use Markdown: short headings, bullet lists, **bold** key terms, and cite verses like "Genesis 1:3". Distinguish clearly between the text itself, historical context, and differing traditions (Ethiopian, Catholic, Protestant, Jewish). Be concise unless asked for depth. If unsure, say so.`;

export function streamStudyAnswer(opts: { messages: ModelMessage[]; passage: string; signal?: AbortSignal }) {
  return streamText({
    model: provider()(GEMINI_MODEL),
    system: `${STUDY_SYSTEM}\n\nThe reader currently has open:\n${opts.passage.slice(0, 12000)}`,
    messages: opts.messages,
    maxRetries: 0,
    ...(opts.signal ? { abortSignal: opts.signal } : {}),
  });
}

export interface VoiceCommand {
  intent: "navigate" | "search" | "ask" | "unknown";
  bookId: string | null;
  chapter: number | null;
  query: string | null;
}

export async function parseVoiceCommand(transcript: string, bookIds: string[]): Promise<VoiceCommand> {
  const result = streamText({
    model: provider()(GEMINI_MODEL),
    maxRetries: 0,
    system: `Convert a casually spoken Bible-app command into JSON only, no prose, no code fences.
Schema: {"intent":"navigate"|"search"|"ask"|"unknown","bookId":string|null,"chapter":number|null,"query":string|null}
- navigate: user wants to open a book/chapter ("take me to the second chapter of first john" -> bookId "1-john", chapter 2). Chapter defaults to 1.
- search: user wants to find words/topics ("find verses about shepherds" -> query "shepherd").
- ask: a question for the study assistant; query = the question.
bookId MUST be one of: ${bookIds.join(", ")}`,
    prompt: transcript.slice(0, 500),
  });
  const text = (await result.text).replace(/```(json)?/g, "").trim();
  try {
    const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return {
      intent: ["navigate", "search", "ask"].includes(j.intent) ? j.intent : "unknown",
      bookId: bookIds.includes(j.bookId) ? j.bookId : null,
      chapter: Number.isFinite(+j.chapter) && +j.chapter > 0 ? Math.floor(+j.chapter) : null,
      query: typeof j.query === "string" ? j.query : null,
    };
  } catch {
    return { intent: "unknown", bookId: null, chapter: null, query: null };
  }
}

export function aiErrorResponse(e: unknown) {
  const status = (e as { statusCode?: number })?.statusCode ?? 500;
  const msg =
    status === 429 ? "The assistant is busy. Please try again in a moment."
    : status === 402 ? "AI credits are used up for this month. Add credits to keep using the assistant."
    : status === 403 ? "The assistant is not available for this workspace right now."
    : "The assistant could not answer right now.";
  console.error("AI error", e);
  return new Response(JSON.stringify({ error: msg }), { status, headers: { "Content-Type": "application/json" } });
}
