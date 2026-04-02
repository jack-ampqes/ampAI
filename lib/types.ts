export type ChatRole = "user" | "assistant" | "system";

export type DbMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};

export type DbConversation = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};
