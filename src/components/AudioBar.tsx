import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Moon, Square } from "lucide-react";
import type { Verse } from "@/lib/bible";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const TIMERS = [0, 5, 15, 30, 60];

// Device voice reader. "Skip 10s" jumps roughly one verse back/forward.
export function AudioBar({ verses, title, onVerse }: { verses: Verse[]; title: string; onVerse: (n: number | null) => void }) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [timer, setTimer] = useState(0);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [supported, setSupported] = useState(true);
  const idxRef = useRef(0);
  const playRef = useRef(false);

  useEffect(() => setSupported("speechSynthesis" in window), []);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  useEffect(() => { stop(); setIdx(0); idxRef.current = 0; }, [verses]); // eslint-disable-line react-hooks/exhaustive-deps

  const speak = (i: number, rate = speed) => {
    const s = window.speechSynthesis;
    s.cancel();
    if (i >= verses.length) { stop(); return; }
    idxRef.current = i; setIdx(i); onVerse(verses[i]?.n ?? null);
    const u = new SpeechSynthesisUtterance(verses[i]?.text ?? "");
    u.rate = rate;
    u.onend = () => { if (playRef.current && idxRef.current === i) speak(i + 1, rate); };
    s.speak(u);
  };
  const stop = () => { playRef.current = false; setPlaying(false); window.speechSynthesis?.cancel(); onVerse(null); };
  const toggle = () => {
    if (playing) { stop(); return; }
    playRef.current = true; setPlaying(true); speak(idxRef.current);
  };
  const skip = (d: number) => { const n = Math.max(0, Math.min(verses.length - 1, idxRef.current + d)); if (playing) speak(n); else { idxRef.current = n; setIdx(n); } };
  const cycleSpeed = () => { const s = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1; setSpeed(s); if (playing) speak(idxRef.current, s); };
  const cycleTimer = () => {
    const t = TIMERS[(TIMERS.indexOf(timer) + 1) % TIMERS.length] ?? 0;
    setTimer(t); setEndsAt(t ? Date.now() + t * 60000 : null);
  };
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => { if (Date.now() >= endsAt) { stop(); setTimer(0); setEndsAt(null); } }, 1000);
    return () => clearInterval(id);
  }, [endsAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!verses.length) return null;
  return (
    <div className="fixed inset-x-3 bottom-[68px] z-30 mx-auto max-w-2xl rounded-2xl bg-slate-green p-3 text-primary-foreground shadow-float dark:text-foreground">
      <div className="mb-2 flex items-center justify-between text-xs opacity-80">
        <span className="truncate">{supported ? `${title} · verse ${verses[idx]?.n ?? 1}` : "Voice reading isn't supported on this device"}</span>
        <span>Device voice · offline</span>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={cycleTimer} aria-label="Sleep timer" className="flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <Moon className="h-4 w-4" />{timer ? `${timer}m` : "Off"}
        </button>
        <button onClick={() => skip(-1)} aria-label="Back 10 seconds"><RotateCcw className="h-6 w-6" /></button>
        <button onClick={toggle} disabled={!supported} aria-label={playing ? "Pause" : "Play"} className="grid h-12 w-12 place-items-center rounded-full bg-gold text-accent-foreground">
          {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
        </button>
        <button onClick={() => skip(1)} aria-label="Forward 10 seconds"><RotateCw className="h-6 w-6" /></button>
        <button onClick={cycleSpeed} aria-label="Playback speed" className="w-12 rounded-full px-2 py-1 text-xs font-bold">{speed}x</button>
      </div>
      {playing && <button onClick={stop} className="sr-only"><Square /></button>}
    </div>
  );
}
