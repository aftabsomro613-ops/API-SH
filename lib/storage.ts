import type { ChatSession } from "./types";

const STORAGE_KEY = "api-sh:sessions:v1";

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn("Failed to load chat sessions from localStorage:", err);
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn("Failed to save chat sessions to localStorage:", err);
  }
}

export function deriveTitle(firstUserMessage: string): string {
  const clean = firstUserMessage.trim().replace(/\s+/g, " ");
  if (clean.length <= 42) return clean || "New chat";
  return clean.slice(0, 42).trimEnd() + "…";
}
