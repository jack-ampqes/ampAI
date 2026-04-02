"use client";

import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

type Props = PressableProps & {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        "items-center justify-center rounded-xl px-4 py-3 active:opacity-80",
        variant === "primary" && "bg-neutral-900 dark:bg-neutral-100",
        variant === "secondary" &&
          "border border-neutral-300 bg-transparent dark:border-neutral-600",
        variant === "ghost" && "bg-transparent",
        disabled && "opacity-50",
        className
      )}
      {...rest}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          className={cn(
            "text-center text-base font-medium",
            variant === "primary" && "text-white dark:text-neutral-900",
            variant !== "primary" && "text-neutral-900 dark:text-neutral-100"
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
