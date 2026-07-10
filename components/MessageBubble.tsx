"use client";

import { Terminal, User2 } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import type { ChatMessage } from "@/lib/types";

export default function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`group flex gap-3 px-4 py-5 md:px-8 animate-rise ${
        isUser ? "" : "bg-base-900/60"
      }`}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[13px] ${
          isUser
            ? "border-ember/30 bg-ember-soft text-ember"
            : "border-signal/30 bg-signal-soft text-signal"
        }`}
      >
        {isUser ? <User2 size={14} /> : <Terminal size={14} />}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`mb-1 text-[11px] font-mono uppercase tracking-wider ${
            isUser ? "text-ember/70" : "text-signal/70"
          }`}
        >
          {isUser ? "you" : "api-sh"}
        </div>

        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-ink-100">
            {message.content}
          </p>
        ) : (
          <div className="text-[15px] text-ink-100">
            <MarkdownRenderer content={message.content} />
            {isStreaming && <span className="animate-blink text-signal">▍</span>}
          </div>
        )}
      </div>
    </div>
  );
}
