// src/components/tool/ToolScreen.tsx
/**
 * Shared frame for every Testing Portal page: header with a back button, a notice when AI is
 * not configured, and a keyboard-aware scroll area so text fields stay above the keyboard.
 */
import { useRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { contentWidth, radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isAiConfigured } from "@/features/ai-settings/lib/llm";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { useGoBack } from "@/lib/navigation";
import { ToolScrollContext } from "./ToolScrollContext";

interface ToolScreenProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  headerRight?: ReactNode;
  /** Set to false for tools that never call the AI, so the "not configured" notice is hidden. */
  usesAi?: boolean;
  /** Set for tool grids and lists that need more room than a form on tablet and desktop. */
  wide?: boolean;
}

export function ToolScreen({ title, children, footer, headerRight, usesAi = true, wide = false }: ToolScreenProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const goBack = useGoBack();
  const { settings, loaded } = useAiSettings();
  const configured = isAiConfigured(settings);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const columnStyle = { maxWidth: wide ? contentWidth.wide : contentWidth.form };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>{headerRight}</View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ToolScrollContext.Provider value={scrollRef}>
          <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            <View style={[styles.column, columnStyle]}>
              {usesAi && loaded && !configured && (
                <Panel>
                  <Text style={[styles.noticeTitle, { color: colors.foreground }]}>AI model not configured</Text>
                  <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
                    Add a model name and API key in AI settings before generating content.
                  </Text>
                  <ActionButton label="Open AI settings" variant="outline" onPress={() => router.push("/admin/settings")} />
                </Panel>
              )}

              {children}
            </View>
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
              <View style={[styles.footerColumn, columnStyle]}>{footer}</View>
            </View>
          ) : null}
        </ToolScrollContext.Provider>
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
  headerRight: {
    minWidth: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  column: {
    width: "100%",
    alignSelf: "center",
    gap: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  footerColumn: {
    width: "100%",
    alignSelf: "center",
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
