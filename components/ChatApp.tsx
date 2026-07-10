"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, AlertTriangle } from "lucide-react";
import { nanoid } from "nanoid";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import type { ChatMessage, ChatSession } from "@/lib/types";
import { loadSessions, saveSessions, deriveTitle } from "@/lib/storage";

function createSession(): ChatSession {
  const now = Date.now();
  return {
    id: nanoid(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export default function ChatApp() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hasHydratedOnce = useRef(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    // React StrictMode runs effects twice in dev — without this guard, the
    // second run would re-read localStorage before the first run's writes
    // land and could spin up a duplicate "fresh" session.
    if (hasHydratedOnce.current) return;
    hasHydratedOnce.current = true;

    const stored = loadSessions();
    if (stored.length > 0) {
      setSessions(stored);
      setActiveId(stored[0].id);
    } else {
      const fresh = createSession();
      setSessions([fresh]);
      setActiveId(fresh.id);
    }
    // Setting this via state (not a ref) matters: it lands in the same
    // batched re-render as the sessions/activeId updates above, so the
    // persist effect below sees the *hydrated* sessions on its first
    // real run — never the stale empty array from before hydration.
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever sessions change (only after hydration
  // has actually landed in this render — see comment above).
  useEffect(() => {
    if (!isHydrated) return;
    saveSessions(sessions);
  }, [sessions, isHydrated]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  const handleNewChat = useCallback(() => {
    const fresh = createSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setSidebarOpen(false);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (id === activeId) {
          setActiveId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeId]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeSession) return;
      setError(null);

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      };

      const assistantId = nanoid();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const isFirstMessage = activeSession.messages.length === 0;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                title: isFirstMessage ? deriveTitle(text) : s.title,
                messages: [...s.messages, userMessage, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );

      setStreamingId(assistantId);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history = [...activeSession.messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || "The assistant failed to respond.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSession.id
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantId ? { ...m, content: accumulated } : m
                    ),
                  }
                : s
            )
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User intentionally stopped generation — not an error state.
        } else {
          const message =
            err instanceof Error ? err.message : "Something went wrong.";
          setError(message);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSession.id
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantId && m.content === ""
                        ? { ...m, content: "_No response was generated._" }
                        : m
                    ),
                  }
                : s
            )
          );
        }
      } finally {
        setStreamingId(null);
        abortRef.current = null;
      }
    },
    [activeSession]
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-base-950">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelect={handleSelect}
        onDelete={handleDelete}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-base-700 bg-base-950/95 px-4 py-3 backdrop-blur md:hidden"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-ink-300 hover:bg-base-800"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-sm font-semibold text-ink-100">
            API-SH
          </span>
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-danger md:mx-8">
            <AlertTriangle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <ChatWindow
          messages={activeSession?.messages ?? []}
          streamingId={streamingId}
          onSuggestion={handleSend}
        />

        <ChatInput
          onSend={handleSend}
          isStreaming={streamingId !== null}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}
