// src/features/testing-portal/components/AnswerTab.tsx
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "../hooks/useRequest";
import { generateAnswer } from "../lib/generators";
import { difficultyOptions, responseFormatOptions } from "../options";
import type { AnswerFormValues } from "../types";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "./FormControls";
import { Section } from "./Section";

const DEFAULTS: AnswerFormValues = {
  question: "",
  context: "",
  difficulty: "Intermediate",
  responseFormat: "bullet_points",
  customInstructions: "",
};

export function AnswerTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<AnswerFormValues>(DEFAULTS);
  const generate = useRequest(generateAnswer);

  function update<K extends keyof AnswerFormValues>(key: K, value: AnswerFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Question"
          placeholder="Enter the theoretical or technical question"
          value={form.question}
          onChangeText={(text) => update("question", text)}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Context"
          placeholder="e.g. Job Interview"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          maxLength={200}
        />
        <Field label="Difficulty">
          <ChoiceChips options={difficultyOptions} value={form.difficulty} onChange={(v) => update("difficulty", v)} />
        </Field>
        <Field label="Response format">
          <ChoiceChips options={responseFormatOptions} value={form.responseFormat} onChange={(v) => update("responseFormat", v)} />
        </Field>
        <TextField
          label="Custom instructions"
          placeholder="Optional"
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          maxLength={1000}
          multiline
        />
        <ActionButton label="Generate answer" icon={BookOpen} loading={generate.pending} onPress={() => generate.run(settings, form)} />
        <ErrorText message={generate.error} />
      </Panel>

      {generate.data && (
        <Panel>
          <Text style={[styles.heading, { color: colors.foreground }]}>Expert answer</Text>
          <Text style={[styles.body, { color: colors.foreground }]} selectable>
            {generate.data.answerText}
          </Text>
          {generate.data.keyConceptsCovered.length > 0 && (
            <View style={[styles.concepts, { borderTopColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Key concepts</Text>
              <View style={styles.chips}>
                {generate.data.keyConceptsCovered.map((concept, index) => (
                  <View key={`${concept}-${index}`} style={[styles.chip, { backgroundColor: colors.tone.amber.bg, borderColor: colors.tone.amber.border }]}>
                    <Text style={[styles.chipText, { color: colors.tone.amber.fg }]}>{concept}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Panel>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
  concepts: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
