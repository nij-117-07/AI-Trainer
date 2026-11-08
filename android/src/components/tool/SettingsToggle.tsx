// src/components/tool/SettingsToggle.tsx
/** Header row that opens and closes a settings form. Shows a one-line summary when closed. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface SettingsToggleProps {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
}

export function SettingsToggle({ title, summary, expanded, onToggle }: SettingsToggleProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? "Hide" : "Show"} ${title.toLowerCase()}`}
      style={({ pressed }) => [
        styles.toggle,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {!expanded && (
          <Text numberOfLines={1} style={[styles.summary, { color: colors.mutedForeground }]}>
            {summary}
          </Text>
        )}
      </View>
      {expanded ? (
        <ChevronUp size={20} color={colors.mutedForeground} />
      ) : (
        <ChevronDown size={20} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  summary: {
    fontSize: 13,
  },
});
