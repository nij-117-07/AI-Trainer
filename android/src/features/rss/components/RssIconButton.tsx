// src/features/rss/components/RssIconButton.tsx
/** Icon-only RSS control with a 48 touch target. The label names the action and the object for screen readers. */
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";

interface RssIconButtonProps {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
}

export function RssIconButton({ label, icon: Icon, onPress, disabled = false, loading = false, destructive = false }: RssIconButtonProps) {
  const colors = useThemeColors();
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: inactive }}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
        inactive && styles.dimmed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.foreground} />
      ) : (
        <Icon size={20} color={destructive ? colors.destructive : colors.foreground} />
      )}
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
  dimmed: {
    opacity: 0.6,
  },
});
