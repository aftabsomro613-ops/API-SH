"use client";

import { Plus, Terminal, Trash2, X } from "lucide-react";
import type { ChatSession } from "@/lib/types";

export default function Sidebar({
  sessions,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  isOpen,
  onClose,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[82vw] max-w-[288px] shrink-0 flex-col border-r border-base-700 bg-base-900 transition-transform md:static md:w-72 md:max-w-none md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-signal/30 bg-signal-soft text-signal">
              <Terminal size={16} />
            </div>
            <div>
              <div className="font-display text-sm font-semibold leading-none text-ink-100">
                API-SH
              </div>
              <div className="mt-0.5 text-[11px] text-ink-700">v2.0 · Next.js</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-500 hover:bg-base-700 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-signal/30 bg-signal-soft py-2.5 text-[13px] font-medium text-signal transition hover:bg-signal/20"
          >
            <Plus size={15} />
            New chat
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-2">
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wider text-ink-700">
            Recent
          </div>
          <div className="flex flex-col gap-0.5">
            {sessions.length === 0 && (
              <p className="px-3 py-2 text-[13px] text-ink-700">
                Your conversations will appear here.
              </p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-1 rounded-lg px-1 ${s.id === activeId ? "bg-base-700" : "hover:bg-base-800"
                  }`}
              >
                <button
                  onClick={() => onSelect(s.id)}
                  className="min-w-0 flex-1 truncate px-2 py-2 text-left text-[13px] text-ink-300 group-hover:text-ink-100"
                  title={s.title}
                >
                  {s.title}
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  aria-label="Delete chat"
                  className="shrink-0 rounded-md p-1.5 text-ink-700 opacity-60 transition hover:bg-base-600 hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          className="border-t border-base-700 px-4 py-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <div className="text-[11px] text-ink-700">
            <span className="text-ink-500">Model</span> · API-SH v2.0
          </div>
          <div className="mt-0.5 text-[11px] text-ink-700">
            Designed by <span className="text-ink-500">Ishfaque Gul</span>
          </div>
        </div>
      </aside>
    </>
  );
}
