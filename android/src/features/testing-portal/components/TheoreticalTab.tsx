// src/features/testing-portal/components/TheoreticalTab.tsx
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "../hooks/useRequest";
import { generateTheoretical } from "../lib/generators";
import { countOptions, theoreticalDifficultyLevelOptions, theoreticalQuestionTypeOptions } from "../options";
import type { TheoreticalFormValues } from "../types";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "./FormControls";
import { Section } from "./Section";

const DEFAULTS: TheoreticalFormValues = {
  topic: "",
  questionType: "architectural",
  numQuestions: 2,
  difficultyLevel: "advanced",
  contextSetting: "",
  sourceContext: "",
  customInstructions: "",
  pastQuestions: "",
};

export function TheoreticalTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<TheoreticalFormValues>(DEFAULTS);
  const generate = useRequest(generateTheoretical);

  function update<K extends keyof TheoreticalFormValues>(key: K, value: TheoreticalFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Microservices"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          maxLength={200}
        />
        <TextField
          label="Context setting"
          placeholder="e.g. High-Tech Enterprise Interview"
          value={form.contextSetting}
          onChangeText={(text) => update("contextSetting", text)}
          maxLength={200}
        />
        <Field label="Question type">
          <ChoiceChips options={theoreticalQuestionTypeOptions} value={form.questionType} onChange={(v) => update("questionType", v)} />
        </Field>
        <Field label="Difficulty">
          <ChoiceChips options={theoreticalDifficultyLevelOptions} value={form.difficultyLevel} onChange={(v) => update("difficultyLevel", v)} />
        </Field>
        <Field label="Number of questions">
          <ChoiceChips options={countOptions(5)} value={form.numQuestions} onChange={(v) => update("numQuestions", v)} />
        </Field>
        <TextField
          label="Source context"
          hint="Optional text or data the questions should be based on."
          value={form.sourceContext}
          onChangeText={(text) => update("sourceContext", text)}
          maxLength={5000}
          multiline
        />
        <TextField
          label="Custom instructions"
          placeholder="Optional"
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          maxLength={1000}
          multiline
        />
        <TextField
          label="Past questions"
          hint="One per line. Used to keep the new questions varied."
          value={form.pastQuestions}
          onChangeText={(text) => update("pastQuestions", text)}
          maxLength={5000}
          multiline
        />
        <ActionButton label="Generate questions" icon={Sparkles} loading={generate.pending} onPress={() => generate.run(settings, form)} />
        <ErrorText message={generate.error} />
      </Panel>

      {generate.data?.map((item, index) => (
        <View key={index} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: colors.tone.rose.bg, borderColor: colors.tone.rose.border }]}>
              <Text style={[styles.badgeText, { color: colors.tone.rose.fg }]}>{item.focusArea}</Text>
            </View>
            <Text style={[styles.index, { color: colors.mutedForeground }]}>Question {index + 1}</Text>
          </View>
          <Text style={[styles.questionText, { color: colors.foreground }]} selectable>
            {item.questionText}
          </Text>
          <View style={[styles.criteria, { borderTopColor: colors.border }]}>
            <Text style={[styles.criteriaLabel, { color: colors.mutedForeground }]}>Evaluation criteria</Text>
            <Text style={[styles.criteriaText, { color: colors.foreground }]} selectable>
              {item.evaluationCriteria}
            </Text>
          </View>
        </View>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  index: {
    fontSize: 13,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  criteria: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  criteriaLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  criteriaText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
