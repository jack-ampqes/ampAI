"use client";

import { Text, View } from "react-native";

export function TypingIndicator() {
  return (
    <View className="my-2 flex-row items-center gap-1 self-start px-4">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        ampAI is typing
      </Text>
      <Text className="animate-pulse text-sm text-neutral-500">…</Text>
    </View>
  );
}
