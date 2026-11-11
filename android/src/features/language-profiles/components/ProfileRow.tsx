// src/features/language-profiles/components/ProfileRow.tsx
/** One language profile in the list. Tap the row to make it active, tap the pencil to edit it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronRight, Pencil } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { describePair } from "../lib/profiles";
import type { LanguageProfile } from "../types";

interface ProfileRowProps {
  profile: LanguageProfile;
  active: boolean;
  disabled: boolean;
  divider: boolean;
  onActivate: () => void;
  onEdit: () => void;
}

export function ProfileRow({ profile, active, disabled, divider, onActivate, onEdit }: ProfileRowProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <Pressable
        onPress={onActivate}
        disabled={disabled || active}
        accessibilityRole="radio"
        accessibilityLabel={`Use ${profile.name}`}
        accessibilityState={{ selected: active, disabled }}
        style={({ pressed }) => [styles.main, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.text}>
          <Text numberOfLines={1} style={[typeScale.label, styles.name, { color: colors.foreground }]}>
            {profile.name}
          </Text>
          <Text numberOfLines={1} style={[typeScale.caption, { color: colors.mutedForeground }]}>
            {describePair(profile)}
          </Text>
        </View>
        {active ? (
          <View style={styles.activeMark}>
            <Check size={16} color={colors.primary} />
            <Text style={[typeScale.caption, styles.activeText, { color: colors.primary }]}>Active</Text>
          </View>
        ) : null}
        <ChevronRight size={18} color={colors.mutedForeground} />
      </Pressable>
      <Pressable
        onPress={onEdit}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Edit profile ${profile.name}`}
        style={({ pressed }) => [styles.edit, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <Pencil size={18} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.xs,
  },
  main: {
    flex: 1,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontWeight: "600",
  },
  activeMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  activeText: {
    fontWeight: "600",
  },
  edit: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
