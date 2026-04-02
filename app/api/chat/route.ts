import { NextResponse } from "next/server";
import { CHAT_CONTEXT_MESSAGE_LIMIT } from "@/lib/constants";
import * as conversationsDb from "@/lib/db/conversations";
import * as messagesDb from "@/lib/db/messages";
import * as usageDb from "@/lib/db/usage";
import { buildModelMessages } from "@/lib/llm/build-context";
import { forwardToGateway } from "@/lib/llm/gateway";
import { requireSessionUser } from "@/lib/auth/require-user";

export async function POST(request: Request) {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { conversationId?: string; content?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  let conversationId = body.conversationId;

  try {
    if (!conversationId) {
      const conv = await conversationsDb.createConversation(
        supabase,
        user.id,
        content.slice(0, 80)
      );
      conversationId = conv.id;
    }

    await messagesDb.insertMessage(supabase, {
      conversationId,
      userId: user.id,
      role: "user",
      content,
    });

    const history = await messagesDb.listMessages(
      supabase,
      conversationId,
      CHAT_CONTEXT_MESSAGE_LIMIT
    );
    const llmMessages = buildModelMessages(history, CHAT_CONTEXT_MESSAGE_LIMIT);

    let assistantText: string;
    try {
      assistantText = await forwardToGateway(llmMessages);
    } catch (e) {
      console.error("[api/chat] gateway error", e);
      return NextResponse.json(
        { error: "LLM gateway unavailable" },
        { status: 502 }
      );
    }

    await messagesDb.insertMessage(supabase, {
      conversationId,
      userId: user.id,
      role: "assistant",
      content: assistantText,
    });

    await conversationsDb.touchConversation(supabase, conversationId);

    await usageDb.logUsageEvent(supabase, user.id, "chat_completion", {
      conversation_id: conversationId,
    });

    return NextResponse.json({
      conversationId,
      message: { role: "assistant" as const, content: assistantText },
    });
  } catch (e) {
    console.error("[api/chat]", e);
    return NextResponse.json({ error: "Chat request failed" }, { status: 500 });
  }
}
