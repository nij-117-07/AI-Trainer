// src/features/skill-architect/components/SkillStatus.tsx
/** Icon, colour, and word for a skill's state. The word is always shown, so the state never depends on colour alone. */
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, Circle, CircleDashed, type LucideIcon } from "lucide-react-native";
import { spacing, typeScale, useThemeColors, type ThemeColors } from "@/theme";
import type { SkillStatus } from "../lib/selection";

export function skillStatusStyle(status: SkillStatus, colors: ThemeColors): { label: string; Icon: LucideIcon; color: string } {
  switch (status) {
    case "learned":
      return { label: "Learned", Icon: CheckCircle2, color: colors.tone.emerald.fg };
    case "inProgress":
      return { label: "In progress", Icon: CircleDashed, color: colors.tone.amber.fg };
    case "notStarted":
      return { label: "Not started", Icon: Circle, color: colors.mutedForeground };
  }
}

export function SkillStatusLabel({ status }: { status: SkillStatus }) {
  const colors = useThemeColors();
  const { label, Icon, color } = skillStatusStyle(status, colors);
  return (
    <View style={styles.row}>
      <Icon size={16} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  text: {
    ...typeScale.caption,
    fontWeight: "600",
  },
});
