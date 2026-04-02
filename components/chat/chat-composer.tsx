"use client";

import { useState } from "react";
import { TextInput, View } from "react-native";
import { Button } from "@/components/ui/button";

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void | Promise<void>;
};

export function ChatComposer({ disabled, onSend }: Props) {
  const [text, setText] = useState("");

  async function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    setText("");
    await onSend(t);
  }

  return (
    <View className="flex-row items-end gap-2 border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-black">
      <TextInput
        className="max-h-32 min-h-12 flex-1 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        placeholder="Message…"
        placeholderTextColor="#737373"
        multiline
        value={text}
        editable={!disabled}
        onChangeText={setText}
        onSubmitEditing={submit}
      />
      <View className="pb-1">
        <Button disabled={disabled || !text.trim()} onPress={submit}>
          Send
        </Button>
      </View>
    </View>
  );
}
