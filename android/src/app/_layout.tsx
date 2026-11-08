// src/app/_layout.tsx
/**
 * Root layout. Single-user app with no login gate: every route is open.
 */
import "@/lib/polyfills";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AiSettingsProvider } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ThemeProvider, useTheme } from "@/theme";

function AppShell() {
  const { colors, resolvedMode } = useTheme();

  return (
    <>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AiSettingsProvider>
        <AppShell />
      </AiSettingsProvider>
    </ThemeProvider>
  );
}
