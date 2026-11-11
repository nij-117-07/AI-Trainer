// src/features/roadmap/components/HeaderAction.tsx
/** Icon-only action for the top bar. Sized and bordered like the reset button. */
import { Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";

interface HeaderActionProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function HeaderAction({ icon: Icon, label, onPress, destructive = false }: HeaderActionProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
