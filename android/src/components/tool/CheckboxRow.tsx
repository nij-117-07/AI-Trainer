// src/components/tool/CheckboxRow.tsx
/** A tickable row for choosing items from a list. The whole row is the touch target. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CheckboxRow({ label, checked, onToggle, disabled = false }: CheckboxRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.muted }, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.box,
          { borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : colors.background },
        ]}
      >
        {checked && <Check size={16} color={colors.primaryForeground} />}
      </View>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderRadius: radius.lg,
    minHeight: 44,
  },
  box: {
    width: 22,
    height: 22,
    marginTop: 2,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  disabled: {
    opacity: 0.6,
  },
});
