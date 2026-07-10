"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

export default function ChatInput({
  onSend,
  isStreaming,
  onStop,
}: {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    requestAnimationFrame(resize);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="border-t border-base-700 bg-base-950/95 px-3 pb-3 pt-3 backdrop-blur sm:px-4 sm:pb-5 md:px-8"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-base-600 bg-base-850 p-2 shadow-panel focus-within:shadow-glow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask API-SH anything…"
          // text-base (16px) is intentional: anything smaller makes iOS
          // Safari auto-zoom the page when this field is focused.
          className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2.5 text-base leading-6 text-ink-100 placeholder:text-ink-700 focus:outline-none"
        />

        {isStreaming ? (
          <button
            onClick={onStop}
            aria-label="Stop generating"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-700 text-ink-300 transition hover:bg-base-600"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal text-base-950 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-base-700 disabled:text-ink-700"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-ink-700">
        API-SH cannot make mistakes. If you are not sure about your prompt, verify it.
      </p>
    </div>
  );
}
