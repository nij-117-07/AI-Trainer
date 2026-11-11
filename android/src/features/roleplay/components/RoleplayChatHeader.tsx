// src/features/roleplay/components/RoleplayChatHeader.tsx
/**
 * Top bar for the roleplay chat: back, the character name with the scenario under it, and icon
 * buttons to edit the persona and start a new chat.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, UserCog } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { useGoBack } from "@/lib/navigation";

interface RoleplayChatHeaderProps {
  name: string;
  scenario: string;
  onNewChat: () => void;
}

export function RoleplayChatHeader({ name, scenario, onNewChat }: RoleplayChatHeaderProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const goBack = useGoBack();

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
          {name}
        </Text>
        <Text numberOfLines={1} style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {scenario}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push("/language-learner/roleplay/persona")}
        accessibilityRole="button"
        accessibilityLabel="Edit persona"
        style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <UserCog size={22} color={colors.foreground} />
      </Pressable>

      <Pressable
        onPress={onNewChat}
        accessibilityRole="button"
        accessibilityLabel="Start new chat"
        style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <Plus size={22} color={colors.foreground} />
      </Pressable>
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
});
