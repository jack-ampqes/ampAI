import type { ChatMessage } from "@/lib/llm/types";

export function buildModelMessages(
  rows: Array<{ role: string; content: string }>,
  maxMessages = 40
): ChatMessage[] {
  const slice = rows.slice(-maxMessages);
  return slice.map((r) => ({
    role: r.role as ChatMessage["role"],
    content: r.content,
  }));
}
