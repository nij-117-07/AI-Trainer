// src/features/counters/components/PillButton.tsx
/** Labeled button for counter and countdown actions. Text sits beside the icon so each action is clear without guessing. */
import { Pressable, StyleSheet, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface PillButtonProps {
  label: string;
  accessibilityLabel?: string;
  icon: LucideIcon;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}

export function PillButton({
  label,
  accessibilityLabel = label,
  icon: Icon,
  onPress,
  primary = false,
  disabled = false,
}: PillButtonProps) {
  const colors = useThemeColors();
  const foreground = primary ? colors.primaryForeground : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.pill,
        primary ? { backgroundColor: colors.primary } : { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon size={18} color={foreground} />
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
