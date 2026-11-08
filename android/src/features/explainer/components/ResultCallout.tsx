// src/features/explainer/components/ResultCallout.tsx
/** Tinted box with a title and icon, used for takeaways, goals, and other highlighted results. */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";

interface ResultCalloutProps {
  icon: LucideIcon;
  title: string;
  tone: Tone;
  children: ReactNode;
}

export function ResultCallout({ icon: Icon, title, tone, children }: ResultCalloutProps) {
  const colors = useThemeColors();
  const palette = colors.tone[tone];
  return (
    <View style={[styles.box, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={styles.header}>
        <Icon size={16} color={palette.fg} />
        <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
