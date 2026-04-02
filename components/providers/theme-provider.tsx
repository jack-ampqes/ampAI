"use client";

import { SafeAreaProvider } from "react-native-safe-area-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
