// src/features/learning-tasks/components/IconButton.tsx
/** Icon-only button with a 48 touch target. Pass checked for a toggle, which is exposed as a checkbox. */
import { Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  color?: string;
  checked?: boolean;
  disabled?: boolean;
}

export function IconButton({ icon: Icon, label, onPress, color, checked, disabled = false }: IconButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={checked === undefined ? "button" : "checkbox"}
      accessibilityLabel={label}
      accessibilityState={{ disabled, ...(checked === undefined ? {} : { checked }) }}
      style={({ pressed }) => [styles.button, pointerCursor, pressed && { backgroundColor: colors.muted }, disabled && styles.disabled]}
    >
      <Icon size={22} color={color ?? colors.foreground} />
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
  disabled: {
    opacity: 0.5,
  },
});
