import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { Sparkles, Mic, Send, Square, Navigation } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Verse } from "@/lib/bible";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

/* eslint-disable @typescript-eslint/no-explicit-any */
function getRecognizer(): any | null {
  if (typeof window === "undefined") return null;
  const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return R ? new R() : null;
}

function listen(onText: (t: string) => void, onEnd: () => void) {
  const r = getRecognizer();
  if (!r) return null;
  r.lang = "en-US";
  r.interimResults = false;
  r.onresult = (e: any) => onText(e.results[0][0].transcript);
  r.onend = onEnd;
  r.onerror = onEnd;
  r.start();
  return r;
}

export function StudyAssistant({ title, verses }: { title: string; verses: Verse[] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState<null | "ask" | "nav">(null);
  const [note, setNote] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const canSpeak = typeof window !== "undefined" && !!getRecognizer;

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs]);
  useEffect(() => { setMsgs([]); }, [title]);

  const passage = `${title}\n${verses.map((v) => `${v.n} ${v.text}`).join("\n")}`;

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const history: Msg[] = [...msgs.filter((m) => !m.error), { role: "user", content: question }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage, messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "The assistant could not answer right now.");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
      if (!acc) throw new Error("No answer came back. Try asking differently.");
    } catch (e) {
      const stopped = (e as Error).name === "AbortError";
      setMsgs((m) => {
        const last = m[m.length - 1];
        if (stopped) return [...m.slice(0, -1), { role: "assistant", content: (last?.content || "") + "\n\n_Stopped._" }];
        return [...m.slice(0, -1), { role: "assistant", content: (e as Error).message, error: true }];
      });
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  function speakQuestion() {
    setNote(null);
    const r = listen((t) => { setInput(t); ask(t); }, () => setListening(null));
    if (r) setListening("ask"); else setNote("Voice input isn't supported in this browser.");
  }

  function voiceNavigate() {
    setNote(null);
    const r = listen(async (t) => {
      setNote(`Heard: “${t}”…`);
      try {
        const res = await fetch("/api/voice-command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: t }) });
        const cmd = await res.json();
        if (!res.ok) throw new Error(cmd.error);
        if (cmd.intent === "navigate" && cmd.bookId) {
          setOpen(false);
          navigate({ to: "/read/$bookId/$chapter", params: { bookId: cmd.bookId, chapter: String(cmd.chapter ?? 1) } });
        } else if (cmd.intent === "search" && cmd.query) {
          setOpen(false);
          navigate({ to: "/search", search: { q: cmd.query } });
        } else if (cmd.intent === "ask") {
          setNote(null);
          ask(cmd.query ?? t);
        } else setNote(`Couldn't understand “${t}”. Try “open John chapter 3”.`);
      } catch (e) {
        setNote((e as Error).message || "Voice command failed.");
      }
    }, () => setListening(null));
    if (r) setListening("nav"); else setNote("Voice input isn't supported in this browser.");
  }

  const suggestions = [`Summarise ${title}`, "Explain the context of this chapter in the Ethiopian canon", "What are the key themes?"];

  return (
    <>
      <Button onClick={() => setOpen(true)} className="fixed bottom-[148px] right-4 z-30 gap-1.5 rounded-full shadow-float" aria-label="Ask AI">
        <Sparkles className="h-4 w-4" />Ask AI
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="reader-sheet inset-x-0 mx-auto flex h-[85dvh] max-w-2xl flex-col rounded-t-lg border-t-2 border-reader-gold px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
          <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-reader-rule" />
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 font-display text-2xl"><Sparkles className="h-5 w-5 text-reader-gold" />Study Assistant</SheetTitle>
            <SheetDescription className="text-reader-verse">Asking about {title}</SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
            {!msgs.length && (
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="block w-full rounded-lg border border-reader-gold/40 px-4 py-3 text-left text-sm hover:bg-reader-gold/10">{s}</button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => m.role === "user" ? (
              <p key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">{m.content}</p>
            ) : (
              <div key={i} className={`prose-study font-reader text-lg leading-relaxed ${m.error ? "text-destructive" : ""}`}>
                {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <p className="animate-pulse text-muted-foreground">Thinking…</p>}
              </div>
            ))}
            <div ref={end} />
          </div>

          {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-3 flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this passage…" aria-label="Your question" className="h-11 min-w-0 flex-1 rounded-full border border-reader-gold/40 bg-transparent px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reader-gold" />
            {canSpeak && <Button type="button" variant="ghost" size="icon" aria-label="Speak a question" title="Speak a question" onClick={speakQuestion} className={listening === "ask" ? "animate-pulse text-destructive" : ""}><Mic /></Button>}
            {canSpeak && <Button type="button" variant="ghost" size="icon" aria-label="Voice navigation" title="Say where to go, e.g. “open John chapter 3”" onClick={voiceNavigate} className={listening === "nav" ? "animate-pulse text-destructive" : ""}><Navigation /></Button>}
            {busy
              ? <Button type="button" size="icon" aria-label="Stop" onClick={() => abort.current?.abort()} className="rounded-full"><Square /></Button>
              : <Button type="submit" size="icon" aria-label="Send" disabled={!input.trim()} className="rounded-full"><Send /></Button>}
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
