// src/features/counters/components/IconButton.tsx
/** Icon-only 48 button for counter and countdown actions. The label names the action and the object. */
import { Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { pointerCursor } from "@/components/tool/FormControls";
import { shape, touchTarget, useThemeColors } from "@/theme";

interface IconButtonProps {
  accessibilityLabel: string;
  icon: LucideIcon;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}

export function IconButton({ accessibilityLabel, icon: Icon, onPress, primary = false, disabled = false }: IconButtonProps) {
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
        styles.button,
        pointerCursor,
        primary ? { backgroundColor: colors.primary } : { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon size={24} color={foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
