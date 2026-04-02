import { NextResponse } from "next/server";
import * as conversationsDb from "@/lib/db/conversations";
import * as messagesDb from "@/lib/db/messages";
import { requireSessionUser } from "@/lib/auth/require-user";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const conversation = await conversationsDb.getConversation(supabase, id);
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const messages = await messagesDb.listMessages(supabase, id);
    return NextResponse.json({ conversation, messages });
  } catch (e) {
    console.error("[api/conversations/[id]] GET", e);
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: { title?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  try {
    const existing = await conversationsDb.getConversation(supabase, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await conversationsDb.updateConversationTitle(supabase, id, body.title.trim());
    const conversation = await conversationsDb.getConversation(supabase, id);
    return NextResponse.json({ conversation });
  } catch (e) {
    console.error("[api/conversations/[id]] PATCH", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await conversationsDb.getConversation(supabase, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await conversationsDb.deleteConversation(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/conversations/[id]] DELETE", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
