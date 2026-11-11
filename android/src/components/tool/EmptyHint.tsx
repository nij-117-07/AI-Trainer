// src/components/tool/EmptyHint.tsx
/** Placeholder shown before a tool's first result, pointing the user to the form. Kept compact so it does not fill the screen. */
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cardPadding, shape, spacing, typeScale, useThemeColors } from "@/theme";

interface EmptyHintProps {
  icon: LucideIcon;
  title: string;
  hint: string;
}

export function EmptyHint({ icon: Icon, title, hint }: EmptyHintProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Icon size={22} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    ...typeScale.title,
    textAlign: "center",
  },
  hint: {
    ...typeScale.body,
    textAlign: "center",
  },
});
