// src/features/theme-settings/components/AppearanceSettings.tsx
/** Appearance controls: light, dark, or system mode, and a colour preset picker. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { radius, spacing, useTheme, type ThemePreference } from "@/theme";
import { THEME_PRESETS, type ThemePreset } from "@/theme/palettes";
import type { ThemeMode } from "@/theme/colors";

const PREFERENCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function AppearanceSettings() {
  const { colors, preference, resolvedMode, presetId, setPreference, setPresetId } = useTheme();

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.foreground }]}>Appearance</Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Choose a colour theme and light or dark mode. Saved on this device.
        </Text>
      </View>

      <View style={styles.segmented}>
        {PREFERENCE_OPTIONS.map((option) => {
          const selected = option.value === preference;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.segment,
                {
                  backgroundColor: selected ? colors.primary : colors.background,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: selected ? colors.primaryForeground : colors.foreground }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {THEME_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            mode={resolvedMode}
            selected={preset.id === presetId}
            onPress={() => setPresetId(preset.id)}
          />
        ))}
      </View>
    </View>
  );
}

interface PresetCardProps {
  preset: ThemePreset;
  mode: ThemeMode;
  selected: boolean;
  onPress: () => void;
}

function PresetCard({ preset, mode, selected, onPress }: PresetCardProps) {
  const { colors } = useTheme();
  const surfaces = preset[mode];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${preset.name} theme`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.preset,
        {
          backgroundColor: surfaces.background,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.swatches}>
        <View style={[styles.swatch, { backgroundColor: surfaces.primary }]} />
        <View style={[styles.swatch, { backgroundColor: surfaces.hero }]} />
        <View style={[styles.swatch, { backgroundColor: surfaces.card, borderWidth: 1, borderColor: surfaces.border }]} />
        {selected && (
          <View style={[styles.check, { backgroundColor: colors.primary }]}>
            <Check size={12} color={colors.primaryForeground} />
          </View>
        )}
      </View>
      <Text style={[styles.presetName, { color: colors.foreground }]}>{preset.name}</Text>
      <Text style={[styles.presetDescription, { color: colors.mutedForeground }]}>{preset.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  segmented: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  preset: {
    width: "48%",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  swatches: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
  },
  check: {
    marginLeft: "auto",
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  presetName: {
    fontSize: 15,
    fontWeight: "600",
  },
  presetDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
});
