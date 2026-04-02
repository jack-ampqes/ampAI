import type { SupabaseClient } from "@supabase/supabase-js";

export async function logUsageEvent(
  supabase: SupabaseClient,
  userId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: eventType,
    metadata,
  });
  if (error) throw error;
}
