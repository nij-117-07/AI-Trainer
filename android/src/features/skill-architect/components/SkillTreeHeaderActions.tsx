// src/features/skill-architect/components/SkillTreeHeaderActions.tsx
/** Top bar actions for one tree: edit and delete while viewing, cancel while editing. Icon only, each names its action. */
import { Pressable, StyleSheet, View } from "react-native";
import { Pencil, Trash2, X, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import type { SkillTreeState } from "../hooks/useSkillTree";

interface SkillTreeHeaderActionsProps {
  state: SkillTreeState;
  onDelete: () => void;
}

export function SkillTreeHeaderActions({ state, onDelete }: SkillTreeHeaderActionsProps) {
  if (!state.tree) return null;

  if (state.editing) {
    return <HeaderIconButton icon={X} label="Cancel editing" onPress={state.cancelEdit} />;
  }

  return (
    <View style={styles.row}>
      <HeaderIconButton icon={Pencil} label="Edit skill tree" onPress={state.startEdit} />
      <HeaderIconButton icon={Trash2} label="Delete skill tree" onPress={onDelete} />
    </View>
  );
}

function HeaderIconButton({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon size={20} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
