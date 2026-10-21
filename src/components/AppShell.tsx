import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Search, Bookmark, Home } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { usePref } from "@/lib/prefs";

export function useReaderTheme() {
  const [dark, setDark] = usePref("dark", false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return [dark, setDark] as const;
}

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/library", label: "Books", icon: BookOpen },
  { to: "/search", label: "Search", icon: Search },
  { to: "/bookmarks", label: "Saved", icon: Bookmark },
] as const;

export function AppShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  useReaderTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className={`mx-auto min-h-screen max-w-2xl pb-40 ${className}`}>
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl justify-around pb-[env(safe-area-inset-bottom)]">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to) || (to === "/library" && path.startsWith("/read"));
            return (
              <Link key={to} to={to} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
