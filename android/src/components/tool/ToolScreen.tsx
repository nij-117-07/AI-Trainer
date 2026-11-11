// src/components/tool/ToolScreen.tsx
/**
 * Shared frame for every Testing Portal page: header with a back button, a notice when AI is
 * not configured, and a keyboard-aware scroll area so text fields stay above the keyboard.
 */
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { contentWidth, radius, shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isAiConfigured } from "@/features/ai-settings/lib/llm";
import { ActionButton, Panel, pointerCursor } from "@/components/tool/FormControls";
import { useGoBack } from "@/lib/navigation";
import { ToolScrollContext } from "./ToolScrollContext";
import { SnackbarSlotContext } from "./snackbar-slot";
import { ToolSlotsContext, type ToolSlots } from "./tool-slots";

interface ToolScreenProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  headerRight?: ReactNode;
  /** Set to false for tools that never call the AI, so the "not configured" notice is hidden. */
  usesAi?: boolean;
  /** Set for tool grids and lists that need more room than a form on tablet and desktop. */
  wide?: boolean;
  /**
   * On tablet and desktop, show the footer as a panel beside the content instead of along the bottom,
   * so the form and the results are visible together. Phones always use the bottom footer.
   */
  footerSide?: boolean;
}

export function ToolScreen({
  title,
  children,
  footer,
  headerRight,
  usesAi = true,
  wide = false,
  footerSide = true,
}: ToolScreenProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const goBack = useGoBack();
  const { settings, loaded } = useAiSettings();
  const { size } = useLayout();
  const configured = isAiConfigured(settings);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [snackbar, setSnackbar] = useState<ReactNode>(null);
  const snackbarSlot = useCallback((node: ReactNode) => setSnackbar(node), []);
  const [slotFooter, setSlotFooter] = useState<ReactNode>(null);
  const [slotHeaderRight, setSlotHeaderRight] = useState<ReactNode>(null);
  const toolSlots = useMemo<ToolSlots>(() => ({ setFooter: setSlotFooter, setHeaderRight: setSlotHeaderRight }), []);
  const footerNode = footer ?? slotFooter;
  const headerNode = headerRight ?? slotHeaderRight;
  const sideBySide = footerSide && !!footerNode && size !== "phone";
  const columnStyle = { maxWidth: sideBySide ? undefined : wide ? contentWidth.wide : contentWidth.form };

  const notice =
    usesAi && loaded && !configured ? (
      <Panel>
        <Text style={[styles.noticeTitle, { color: colors.foreground }]}>AI model not configured</Text>
        <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
          Add a model name and API key in AI settings before generating content.
        </Text>
        <ActionButton label="Open AI settings" variant="outline" onPress={() => router.push("/admin/settings")} />
      </Panel>
    ) : null;

  const scroll = (
    <ScrollView
      ref={scrollRef}
      style={sideBySide ? styles.flex : undefined}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={[styles.column, columnStyle]}>
        {notice}
        {children}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text accessibilityRole="header" style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>{headerNode}</View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SnackbarSlotContext.Provider value={snackbarSlot}>
        <ToolSlotsContext.Provider value={toolSlots}>
        <ToolScrollContext.Provider value={scrollRef}>
          {sideBySide ? (
            <View style={[styles.split, { maxWidth: wide ? contentWidth.wide + contentWidth.sidePanel : contentWidth.wide }]}>
              {scroll}
              <View style={[styles.sidePanel, { backgroundColor: colors.background, borderLeftColor: colors.border }]}>
                <ScrollView contentContainerStyle={styles.sidePanelContent} keyboardShouldPersistTaps="handled">
                  {footerNode}
                </ScrollView>
              </View>
            </View>
          ) : (
            <>
              {scroll}
              {snackbar ? <View style={styles.snackbarSlot}>{snackbar}</View> : null}
              {footerNode ? (
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                  <View style={[styles.footerColumn, { maxWidth: contentWidth.form }]}>{footerNode}</View>
                </View>
              ) : null}
            </>
          )}
          {sideBySide && snackbar ? <View style={styles.snackbarSlot}>{snackbar}</View> : null}
        </ToolScrollContext.Provider>
        </ToolSlotsContext.Provider>
        </SnackbarSlotContext.Provider>
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
  snackbarSlot: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
    flex: 1,
    marginHorizontal: spacing.sm,
    textAlign: "center",
    ...typeScale.title,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    minWidth: touchTarget,
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
  split: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
  },
  sidePanel: {
    width: contentWidth.sidePanel,
    borderLeftWidth: 1,
  },
  sidePanelContent: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
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
