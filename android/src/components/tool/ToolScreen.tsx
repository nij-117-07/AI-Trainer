// src/components/tool/ToolScreen.tsx
/**
 * Shared frame for every Testing Portal page: header with a back button, a notice when AI is
 * not configured, and a keyboard-aware scroll area so text fields stay above the keyboard.
 */
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, PanelRight, X } from "lucide-react-native";
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
  /** Shown under the title in the header, in one line. */
  subtitle?: string;
  /**
   * Extra panel for the side. On tablet and desktop it sits in the side panel above the footer; on
   * phones a button in the header opens it as a bottom sheet.
   */
  sidebar?: ReactNode;
  /**
   * Content fills the space between the header and the footer and is not scrolled as a whole. Use it
   * when a child has its own scrolling area, such as a chat that should take the remaining height.
   */
  fill?: boolean;
}

export function ToolScreen({
  title,
  children,
  footer,
  headerRight,
  usesAi = true,
  wide = false,
  footerSide = true,
  subtitle,
  sidebar,
  fill = false,
}: ToolScreenProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const goBack = useGoBack();
  const { settings, loaded } = useAiSettings();
  const { size } = useLayout();
  const configured = isAiConfigured(settings);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [snackbar, setSnackbar] = useState<ReactNode>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const snackbarSlot = useCallback((node: ReactNode) => setSnackbar(node), []);
  const [slotFooter, setSlotFooter] = useState<ReactNode>(null);
  const [slotHeaderRight, setSlotHeaderRight] = useState<ReactNode>(null);
  const toolSlots = useMemo<ToolSlots>(() => ({ setFooter: setSlotFooter, setHeaderRight: setSlotHeaderRight }), []);
  const footerNode = footer ?? slotFooter;
  const headerNode = headerRight ?? slotHeaderRight;
  const sideBySide = footerSide && (!!footerNode || !!sidebar) && size !== "phone";
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

  const body = fill ? (
    <View style={[styles.fillBody, styles.flex]}>
      <View style={[styles.column, styles.fillColumn, columnStyle]}>
        {notice}
        {children}
      </View>
    </View>
  ) : (
    scroll
  );

  const sheetButton = sidebar && !sideBySide;

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
        <View style={styles.titleBlock}>
          <Text accessibilityRole="header" style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerRight}>
          {sheetButton ? (
            <Pressable
              onPress={() => setSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Open sidebar"
              style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
            >
              <PanelRight size={20} color={colors.foreground} />
            </Pressable>
          ) : null}
          {headerNode}
        </View>
      </View>

      {sheetButton ? (
        <SidebarSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
          {sidebar}
        </SidebarSheet>
      ) : null}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SnackbarSlotContext.Provider value={snackbarSlot}>
        <ToolSlotsContext.Provider value={toolSlots}>
        <ToolScrollContext.Provider value={scrollRef}>
          {sideBySide ? (
            <View style={[styles.split, { maxWidth: wide ? contentWidth.wide + contentWidth.sidePanel : contentWidth.wide }]}>
              {body}
              <View style={[styles.sidePanel, { backgroundColor: colors.background, borderLeftColor: colors.border }]}>
                <ScrollView contentContainerStyle={styles.sidePanelContent} keyboardShouldPersistTaps="handled">
                  <View style={styles.sidePanelStack}>
                    {sidebar}
                    {footerNode}
                  </View>
                </ScrollView>
              </View>
            </View>
          ) : (
            <>
              {body}
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

function SidebarSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} accessible={false} />
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close sidebar"
              style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
            >
              <X size={20} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  titleBlock: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    textAlign: "center",
    ...typeScale.title,
  },
  headerSubtitle: {
    textAlign: "center",
    ...typeScale.caption,
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
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  fillBody: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  fillColumn: {
    flex: 1,
    minHeight: 0,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    maxHeight: "80%",
    borderTopWidth: 1,
    borderTopLeftRadius: shape.lg,
    borderTopRightRadius: shape.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetContent: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
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
  sidePanelStack: {
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
