import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatRole, DbMessage } from "@/lib/types";

export async function listMessages(
  supabase: SupabaseClient,
  conversationId: string,
  limit = 200
): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function insertMessage(
  supabase: SupabaseClient,
  params: {
    conversationId: string;
    userId: string;
    role: ChatRole;
    content: string;
  }
): Promise<DbMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      user_id: params.userId,
      role: params.role,
      content: params.content,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
