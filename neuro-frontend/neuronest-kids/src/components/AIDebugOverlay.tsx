import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type AdaptiveAIEvent = {
  ts: number;
  action: string;
  childId?: string;
  request: unknown;
  result: unknown;
  error?: string;
};

const EVENT_NAME = "neuronest:adaptive-ai";

function shouldShowOverlay(): boolean {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("aiDebug") === "1") return true;
    return localStorage.getItem("neuronest_ai_debug") === "1";
  } catch {
    return false;
  }
}

export function AIDebugOverlay({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [events, setEvents] = useState<AdaptiveAIEvent[]>([]);

  useEffect(() => {
    setEnabled(shouldShowOverlay());

    const onPopState = () => setEnabled(shouldShowOverlay());
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<AdaptiveAIEvent>;
      const next = ce.detail;
      if (!next?.ts || !next?.action) return;
      setEvents((prev) => [next, ...prev].slice(0, 20));
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [enabled]);

  const latest = events[0];
  const title = useMemo(() => {
    if (!latest) return "AI Debug";
    const t = new Date(latest.ts).toLocaleTimeString();
    return `AI Debug • ${latest.action} • ${t}`;
  }, [latest]);

  if (!enabled) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[60] w-[min(92vw,420px)] rounded-2xl border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">
            Toggle: add <Badge variant="outline">?aiDebug=1</Badge> or set localStorage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                navigator.clipboard.writeText(JSON.stringify(events, null, 2));
              } catch {
                // ignore
              }
            }}
          >
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("neuronest_ai_debug");
              const url = new URL(window.location.href);
              url.searchParams.delete("aiDebug");
              window.history.replaceState({}, "", url.toString());
              setEnabled(false);
            }}
          >
            Hide
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[260px] px-4 py-3">
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No AI calls captured yet. Trigger a hint / wrong-streak encouragement / difficulty
            adjustment in a game.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.ts} className="rounded-xl border bg-background/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(ev.ts).toLocaleString()}
                      {ev.childId ? ` • child ${ev.childId.slice(0, 6)}…` : ""}
                    </p>
                  </div>
                  {ev.error ? (
                    <Badge variant="destructive">error</Badge>
                  ) : (
                    <Badge variant="secondary">ok</Badge>
                  )}
                </div>

                {ev.error ? (
                  <p className="mt-2 text-xs text-destructive">{ev.error}</p>
                ) : null}

                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    request / result
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-foreground">
                    {JSON.stringify({ request: ev.request, result: ev.result }, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
