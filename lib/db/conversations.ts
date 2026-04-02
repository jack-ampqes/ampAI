import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbConversation } from "@/lib/types";

export async function listConversations(
  supabase: SupabaseClient
): Promise<DbConversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getConversation(
  supabase: SupabaseClient,
  id: string
): Promise<DbConversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createConversation(
  supabase: SupabaseClient,
  userId: string,
  title?: string
): Promise<DbConversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: title?.trim() || "New chat",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConversationTitle(
  supabase: SupabaseClient,
  id: string,
  title: string
) {
  const { error } = await supabase
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function touchConversation(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteConversation(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) throw error;
}
