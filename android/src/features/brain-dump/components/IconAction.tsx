// src/features/brain-dump/components/IconAction.tsx
/** Icon-only button for a note action. The label names the action, since the icon carries no text. */
import { Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";

interface IconActionProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  color?: string;
  filled?: boolean;
  selected?: boolean;
}

export function IconAction({ icon: Icon, label, onPress, color, filled = false, selected = false }: IconActionProps) {
  const colors = useThemeColors();
  const iconColor = color ?? colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.button, pointerCursor, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon size={22} color={iconColor} fill={filled ? iconColor : "none"} />
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
});
