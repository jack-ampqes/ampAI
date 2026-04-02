"use client";

import { Pressable, ScrollView, Text, View } from "react-native";
import type { DbConversation } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  conversations: DbConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: Props) {
  return (
    <View className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 md:w-72 md:border-b-0 md:border-r">
      <View className="flex-row items-center justify-between border-b border-neutral-200 px-3 py-3 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Chats
        </Text>
        <Pressable
          accessibilityRole="button"
          className="rounded-lg bg-neutral-900 px-3 py-2 dark:bg-neutral-100"
          onPress={onNew}
        >
          <Text className="text-sm font-medium text-white dark:text-neutral-900">
            New
          </Text>
        </Pressable>
      </View>
      <ScrollView className="max-h-40 md:max-h-none md:flex-1">
        {conversations.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            className={cn(
              "border-b border-neutral-100 px-3 py-3 dark:border-neutral-800",
              activeId === c.id && "bg-white dark:bg-neutral-900"
            )}
            onPress={() => onSelect(c.id)}
          >
            <Text
              className="font-medium text-neutral-900 dark:text-neutral-100"
              numberOfLines={1}
            >
              {c.title || "Chat"}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {new Date(c.updated_at).toLocaleString()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
