// src/features/explainer/components/SectionTitle.tsx
/** Icon and heading shown at the top of a result panel. */
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";

interface SectionTitleProps {
  icon: LucideIcon;
  title: string;
}

export function SectionTitle({ icon: Icon, title }: SectionTitleProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <Icon size={16} color={colors.primary} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
});
