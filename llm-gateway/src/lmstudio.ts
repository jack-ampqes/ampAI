import type { ChatRequestBody, OpenAIChatResponse } from "./types.js";

export async function forwardToLmStudio(
  lmStudioUrl: string,
  body: ChatRequestBody
): Promise<OpenAIChatResponse> {
  const res = await fetch(lmStudioUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: body.model ?? "local-model",
      messages: body.messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LM Studio ${res.status}: ${text}`);
  }

  return (await res.json()) as OpenAIChatResponse;
}
