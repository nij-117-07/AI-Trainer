// src/features/testing-portal/components/AnswerTab.tsx
/**
 * Expert answer. Settings collapse once an answer is shown. "Reset" clears the form and the answer.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, RefreshCcw } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { generateAnswer } from "../lib/generators";
import { difficultyOptions, responseFormatOptions } from "../options";
import type { AnswerFormValues, ResponseFormat } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";

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
  const [showSettings, setShowSettings] = useState(true);
  const generate = useRequest(generateAnswer);

  function update<K extends keyof AnswerFormValues>(key: K, value: AnswerFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const result = await generate.run(settings, form);
    if (result) setShowSettings(false);
  }

  function reset() {
    setForm(DEFAULTS);
    generate.reset();
    setShowSettings(true);
  }

  const formatLabel = responseFormatOptions.find((option) => option.value === form.responseFormat)?.label ?? "";
  const questionPreview = form.question.trim() || "No question yet";
  const summary = `${questionPreview} · ${form.difficulty} · ${formatLabel}`;
  const answer = generate.data;

  return (
    <Section>
      <SettingsToggle
        title="Settings"
        summary={summary}
        expanded={showSettings}
        onToggle={() => setShowSettings((value) => !value)}
      />

      {showSettings && (
        <Panel>
          <TextField
            label="Question"
            placeholder="Enter the theoretical or technical question"
            value={form.question}
            onChangeText={(text) => update("question", text)}
            maxLength={2000}
            multiline
            voice
          />
          <TextField
            label="Context"
            placeholder="e.g. Job Interview"
            value={form.context}
            onChangeText={(text) => update("context", text)}
            maxLength={200}
          />
          <SelectField
            label="Difficulty"
            options={difficultyOptions}
            value={form.difficulty}
            onChange={(value) => update("difficulty", value)}
            customPlaceholder="Type your own difficulty"
          />
          <SelectField
            label="Response format"
            options={responseFormatOptions}
            value={form.responseFormat}
            onChange={(value) => update("responseFormat", value as ResponseFormat)}
            allowCustom={false}
          />
          <TextField
            label="Custom instructions"
            placeholder="Optional"
            value={form.customInstructions}
            onChangeText={(text) => update("customInstructions", text)}
            maxLength={1000}
            multiline
            voice
          />
          <ActionButton label="Generate answer" icon={BookOpen} loading={generate.pending} onPress={handleGenerate} />
        </Panel>
      )}

      <ErrorText message={generate.error} />

      {answer && (
        <>
          <Panel>
            <Text style={[styles.heading, { color: colors.foreground }]}>Expert answer</Text>
            <Text style={[styles.body, { color: colors.foreground }]} selectable>
              {answer.answerText}
            </Text>
            <ListenButton text={answer.answerText} label="Answer" />
            {answer.keyConceptsCovered.length > 0 && (
              <View style={[styles.concepts, { borderTopColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Key concepts</Text>
                <View style={styles.chips}>
                  {answer.keyConceptsCovered.map((concept, index) => (
                    <View
                      key={`${concept}-${index}`}
                      style={[styles.chip, { backgroundColor: colors.tone.amber.bg, borderColor: colors.tone.amber.border }]}
                    >
                      <Text style={[styles.chipText, { color: colors.tone.amber.fg }]}>{concept}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Panel>
          <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
        </>
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
