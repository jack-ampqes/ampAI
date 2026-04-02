"use client";

import { View } from "react-native";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <View className="min-h-screen flex-1 justify-center bg-neutral-50 px-4 dark:bg-black">
      <LoginForm />
    </View>
  );
}
