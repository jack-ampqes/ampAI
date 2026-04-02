"use client";

import { Text, View } from "react-native";
import { cn } from "@/lib/utils";

type Props = {
  role: "user" | "assistant" | "system";
  content: string;
};

export function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <View
      className={cn(
        "my-1 max-w-[85%] rounded-2xl px-4 py-3",
        isUser && "self-end bg-neutral-900 dark:bg-neutral-200",
        !isUser && role !== "system" && "self-start bg-neutral-100 dark:bg-neutral-800",
        role === "system" && "self-center bg-neutral-200 dark:bg-neutral-700"
      )}
    >
      <Text
        className={cn(
          "text-base leading-6",
          isUser && "text-white dark:text-neutral-900",
          !isUser && "text-neutral-900 dark:text-neutral-100"
        )}
      >
        {content}
      </Text>
    </View>
  );
}
