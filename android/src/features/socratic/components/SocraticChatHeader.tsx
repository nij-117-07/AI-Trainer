// src/features/socratic/components/SocraticChatHeader.tsx
/**
 * Top bar for the Socratic chat: back, the challenger with the model name under it, New chat, and a
 * menu. The menu is a modal, so Android back closes it before leaving the page.
 */
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, EllipsisVertical, SlidersHorizontal, SquarePen } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useGoBack } from "@/lib/navigation";

export function SocraticChatHeader({
  onNewChat,
  menuOpen,
  onMenuOpenChange,
}: {
  onNewChat: () => void;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const colors = useThemeColors();
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { settings } = useAiSettings();
  const setMenuOpen = onMenuOpenChange;
  const model = settings.modelName.trim() || "No AI model set";

  return (
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
        <Text accessibilityRole="header" numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
          Socratic Challenger
        </Text>
        <Text numberOfLines={1} style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {model}
        </Text>
      </View>

      <Pressable
        onPress={onNewChat}
        accessibilityRole="button"
        accessibilityLabel="Start new chat"
        style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <SquarePen size={22} color={colors.foreground} />
      </Pressable>

      <Pressable
        onPress={() => setMenuOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open chat menu"
        accessibilityState={{ expanded: menuOpen }}
        style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <EllipsisVertical size={22} color={colors.foreground} />
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setMenuOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close chat menu"
        />
        <View style={[styles.menu, { top: insets.top + 56, backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              router.push("/practice/socratic/settings");
            }}
            accessibilityRole="menuitem"
            accessibilityLabel="Discussion settings"
            style={({ pressed }) => [styles.menuItem, pointerCursor, pressed && { backgroundColor: colors.muted }]}
          >
            <SlidersHorizontal size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>Discussion settings</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typeScale.title,
  },
  subtitle: {
    ...typeScale.caption,
  },
  menu: {
    position: "absolute",
    right: spacing.sm,
    minWidth: 220,
    borderWidth: 1,
    borderRadius: shape.sm,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuText: {
    ...typeScale.label,
  },
});
