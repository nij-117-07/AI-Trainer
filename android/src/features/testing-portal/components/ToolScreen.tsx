// src/features/testing-portal/components/ToolScreen.tsx
/**
 * Shared frame for every Testing Portal page: header with a back button, a notice when AI is
 * not configured, and a keyboard-aware scroll area so text fields stay above the keyboard.
 */
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isAiConfigured } from "../lib/llm";
import { ActionButton, Panel } from "./FormControls";

interface ToolScreenProps {
  title: string;
  children: ReactNode;
}

export function ToolScreen({ title, children }: ToolScreenProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings, loaded } = useAiSettings();
  const configured = isAiConfigured(settings);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.iconSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {loaded && !configured && (
            <Panel>
              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>AI model not configured</Text>
              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
                Add a model name and API key in AI settings before generating content.
              </Text>
              <ActionButton label="Open AI settings" variant="outline" onPress={() => router.push("/admin/settings")} />
            </Panel>
          )}

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 40,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
