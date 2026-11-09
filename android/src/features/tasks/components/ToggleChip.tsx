// src/features/tasks/components/ToggleChip.tsx
/** A chip that can be selected on its own or together with others. */
import { Pressable, StyleSheet, Text } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface ToggleChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function ToggleChip({ label, selected = false, onPress }: ToggleChipProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : colors.card,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, { color: selected ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.8,
  },
});
