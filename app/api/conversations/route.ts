import { NextResponse } from "next/server";
import * as conversationsDb from "@/lib/db/conversations";
import { requireSessionUser } from "@/lib/auth/require-user";

export async function GET() {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await conversationsDb.listConversations(supabase);
    return NextResponse.json({ conversations: list });
  } catch (e) {
    console.error("[api/conversations] GET", e);
    return NextResponse.json({ error: "Failed to list conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  try {
    const conv = await conversationsDb.createConversation(
      supabase,
      user.id,
      body.title
    );
    return NextResponse.json({ conversation: conv });
  } catch (e) {
    console.error("[api/conversations] POST", e);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
