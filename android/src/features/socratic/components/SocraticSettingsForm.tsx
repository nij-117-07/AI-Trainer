// src/features/socratic/components/SocraticSettingsForm.tsx
/**
 * Socratic settings page body: what the challenger should do, and how confident the user is. Both
 * are fixed choices, so the dropdowns have no Custom entry. Each change saves as it is made.
 */
import { StyleSheet, Text } from "react-native";
import { Scale } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { CONFIDENCE_OPTIONS, FOCUS_OPTIONS } from "../options";
import type { SocraticSettingsState } from "../hooks/useSocraticSettings";
import type { SocraticFocus } from "../types";

export function SocraticSettingsFields({ settings }: { settings: SocraticSettingsState }) {
  const colors = useThemeColors();
  const focusOption = FOCUS_OPTIONS.find((option) => option.value === settings.focus);

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Scale} title="How the challenger pushes" />
        <SelectField
          label="What should the challenger do?"
          options={FOCUS_OPTIONS}
          value={settings.focus}
          onChange={(value) => settings.setFocus(value as SocraticFocus)}
          allowCustom={false}
        />
        {focusOption?.hint && <Text style={[styles.hint, { color: colors.mutedForeground }]}>{focusOption.hint}</Text>}
        <SelectField
          label="Your confidence"
          options={CONFIDENCE_OPTIONS}
          value={settings.confidence}
          onChange={settings.setConfidence}
          allowCustom={false}
        />
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Higher confidence makes the challenger push harder.
        </Text>
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
});
