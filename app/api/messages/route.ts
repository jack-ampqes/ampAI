import { NextResponse } from "next/server";
import * as messagesDb from "@/lib/db/messages";
import * as conversationsDb from "@/lib/db/conversations";
import { requireSessionUser } from "@/lib/auth/require-user";

export async function GET(request: Request) {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId query required" },
      { status: 400 }
    );
  }

  try {
    const conv = await conversationsDb.getConversation(supabase, conversationId);
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const messages = await messagesDb.listMessages(supabase, conversationId);
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("[api/messages] GET", e);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
