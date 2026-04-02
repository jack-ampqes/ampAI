"use client";

import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatSignInError(e: unknown): { text: string; kind: "success" | "error" | "rateLimit" } {
  const raw =
    e && typeof e === "object" && "message" in e
      ? String((e as { message: string }).message)
      : e instanceof Error
        ? e.message
        : "Something went wrong";
  const lower = raw.toLowerCase();
  const status =
    e && typeof e === "object" && "status" in e
      ? Number((e as { status?: number }).status)
      : NaN;

  if (
    status === 429 ||
    lower.includes("rate limit") ||
    lower.includes("too many requests")
  ) {
    return {
      kind: "rateLimit",
      text: "Email rate limit reached. Supabase’s built-in mailer only allows a few sign-in emails per hour on many plans. Wait up to an hour and try again, or raise the limit by adding custom SMTP under Authentication → Emails in the Supabase dashboard.",
    };
  }

  return { kind: "error", text: raw };
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<
    "success" | "error" | "rateLimit" | null
  >(null);

  async function onSubmit() {
    setLoading(true);
    setMessage(null);
    setMessageKind(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });
      if (error) throw error;
      setMessageKind("success");
      setMessage(
        "Check your email and tap the magic link to sign in. You can close this tab."
      );
    } catch (e: unknown) {
      const { text, kind } = formatSignInError(e);
      setMessageKind(kind);
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="w-full max-w-md gap-4 self-center p-6">
      <Text className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
        {APP_NAME}
      </Text>
      <Text className="text-base text-neutral-600 dark:text-neutral-400">
        Sign in with email. We will send you a link to sign in — no password or code to
        type.
      </Text>
      <Input
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <Button disabled={loading || !email.trim()} onPress={onSubmit}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          "Send sign-in email"
        )}
      </Button>
      {message ? (
        <Text
          className={
            messageKind === "success"
              ? "text-sm text-neutral-600 dark:text-neutral-400"
              : messageKind === "rateLimit"
                ? "text-sm text-amber-800 dark:text-amber-200"
                : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
