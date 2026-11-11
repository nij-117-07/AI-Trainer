// src/features/topic-of-the-day/components/IconAction.tsx
/** Icon-only button for a row or the top bar. The label names the action and the object it acts on. */
import { Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { pointerCursor } from "@/components/tool/FormControls";
import { shape, touchTarget, useThemeColors } from "@/theme";

interface IconActionProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function IconAction({ icon: Icon, label, onPress, destructive = false }: IconActionProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, pointerCursor, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon size={20} color={destructive ? colors.destructive : colors.foreground} />
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
