"use client";

import { useCallback, useEffect, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import type { DbConversation, DbMessage } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageList } from "@/components/chat/message-list";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Pressable } from "react-native";

export function ChatLayout() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setLoadingConvos(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = (await res.json()) as { conversations: DbConversation[] };
      setConversations(data.conversations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = (await res.json()) as { messages: DbMessage[] };
      setMessages(data.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleSend(content: string) {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId ?? undefined,
          content,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Send failed");
      }
      const data = (await res.json()) as {
        conversationId: string;
        message: { role: string; content: string };
      };
      setActiveId(data.conversationId);
      await loadConversations();
      await loadMessages(data.conversationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <View className="min-h-screen flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {APP_NAME}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="rounded-lg px-3 py-2"
          onPress={() => void signOut()}
        >
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            Sign out
          </Text>
        </Pressable>
      </View>

      <View className={wide ? "flex-1 flex-row" : "flex-1 flex-col"}>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
          onNew={() => {
            setActiveId(null);
            setMessages([]);
          }}
        />

        <View className="flex-1">
          {loadingConvos && conversations.length === 0 ? (
            <Text className="p-4 text-neutral-500">Loading…</Text>
          ) : null}
          {error ? (
            <Text className="p-4 text-red-600 dark:text-red-400">{error}</Text>
          ) : null}

          {!activeId && messages.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6">
              <Text className="text-center text-neutral-600 dark:text-neutral-400">
                Choose a conversation or start a new message below.
              </Text>
            </View>
          ) : loadingMessages ? (
            <Text className="p-4 text-neutral-500">Loading messages…</Text>
          ) : (
            <MessageList messages={messages} />
          )}

          {sending ? <TypingIndicator /> : null}

          <ChatComposer disabled={sending} onSend={handleSend} />
        </View>
      </View>
    </View>
  );
}
