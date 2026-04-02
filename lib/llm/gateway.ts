import type { ChatMessage, GatewayChatResponse } from "@/lib/llm/types";

export async function forwardToGateway(
  messages: ChatMessage[],
  options?: { model?: string }
): Promise<string> {
  const url = process.env.LLM_GATEWAY_URL;
  const secret = process.env.LLM_GATEWAY_SECRET;
  if (!url || !secret) {
    throw new Error("LLM_GATEWAY_URL or LLM_GATEWAY_SECRET is not set");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      model: options?.model ?? "local-model",
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway ${res.status}: ${text}`);
  }

  const data = (await res.json()) as GatewayChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid gateway response: missing message content");
  }
  return content;
}
