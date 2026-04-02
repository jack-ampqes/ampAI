"use client";

import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

type Props = TextInputProps & { className?: string };

export function Input({ className, ...rest }: Props) {
  return (
    <TextInput
      className={cn(
        "rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100",
        className
      )}
      placeholderTextColor="#737373"
      {...rest}
    />
  );
}
