"use client";

import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import type { DbMessage } from "@/lib/types";
import { MessageBubble } from "@/components/chat/message-bubble";

type Props = {
  messages: DbMessage[];
};

export function MessageList({ messages }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 px-3 py-2"
      contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
    >
      <View className="gap-1">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
      </View>
    </ScrollView>
  );
}
