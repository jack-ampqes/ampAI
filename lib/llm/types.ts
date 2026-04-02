export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type GatewayChatResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};
