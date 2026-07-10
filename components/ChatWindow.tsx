"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Explain the difference between server and client components in Next.js",
  "Write a PostgreSQL query to find duplicate rows",
  "Design a REST API for a task manager",
  "Debug why my Azure OpenAI call is timing out",
];

export default function ChatWindow({
  messages,
  streamingId,
  onSuggestion,
}: {
  messages: ChatMessage[];
  streamingId: string | null;
  onSuggestion: (text: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streamingId]);

  if (messages.length === 0) {
    return (
      <div className="relative flex flex-1 min-h-0 flex-col items-center justify-center overflow-y-auto px-4 sm:px-6">
        <div className="bg-signal-grid pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-signal/30 bg-signal-soft text-signal shadow-glow">
            <Terminal size={26} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
            API-SH
            <span className="text-signal">_</span>
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Advanced Programming Intelligence · Software Helper
          </p>
          <p className="mt-1 text-[13px] text-ink-700">
            Built on Azure OpenAI · Designed by Ishfaque Gul
          </p>

          <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:mt-9 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="rounded-xl border border-base-600 bg-base-850 px-4 py-3 text-left text-[13px] text-ink-300 transition hover:border-signal/40 hover:text-ink-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex max-w-3xl flex-col divide-y divide-base-800/60">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isStreaming={m.id === streamingId} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
