export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatRequestBody = {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
};

export type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};
