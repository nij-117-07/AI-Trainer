// src/features/guides/components/GuideTaskTab.tsx
/** Guide Tasks: mentor feedback and a set of actionable tasks toward a goal. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ListChecks, Lightbulb, RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useRequest } from "@/hooks/useRequest";
import { generateGuideTasks } from "../lib/generators";
import { GUIDE_STORAGE_KEYS } from "../lib/persistence";
import { CURRENT_LEVEL_OPTIONS } from "../options";
import { usePersistedGuide } from "../hooks/usePersistedGuide";
import type { GuideTaskFormValues, GuideTaskResult } from "../types";
import { EmptyNote } from "./ResultParts";

const DEFAULTS: GuideTaskFormValues = {
  subject: "FastAPI",
  goal: "Build production-grade Python APIs",
  currentLevel: "Intermediate",
  count: 3,
  history: "",
  instructions: "",
};

export function GuideTaskTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedGuide<GuideTaskFormValues, GuideTaskResult>(
    GUIDE_STORAGE_KEYS.task,
    DEFAULTS,
  );
  const request = useRequest(generateGuideTasks);

  function update<K extends keyof GuideTaskFormValues>(key: K, value: GuideTaskFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Subject"
          placeholder="e.g. FastAPI"
          value={form.subject}
          onChangeText={(text) => update("subject", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Your goal"
          placeholder="e.g. Build production-grade Python APIs"
          value={form.goal}
          onChangeText={(text) => update("goal", text)}
          editable={!request.pending}
          maxLength={500}
          multiline
          voice
        />
        <SelectField
          label="Current level"
          options={CURRENT_LEVEL_OPTIONS}
          value={form.currentLevel}
          onChange={(value) => update("currentLevel", value)}
          allowCustom={false}
        />
        <CountSlider label="Number of tasks" max={10} value={form.count} onChange={(value) => update("count", value)} />
        <TextField
          label="Tasks already completed (optional)"
          placeholder="One completed task per line…"
          hint="The mentor builds on what you have already done."
          value={form.history}
          onChangeText={(text) => update("history", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Instructions (optional)"
          placeholder="e.g. Clean folder structure"
          value={form.instructions}
          onChangeText={(text) => update("instructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <ActionButton
          label={request.pending ? "Crafting your tasks…" : "Generate tasks"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.mentorFeedback !== "" && (
            <ResultCallout icon={Lightbulb} title="Mentor feedback" tone="sky">
              <MarkdownText content={result.mentorFeedback} />
              <ListenButton text={result.mentorFeedback} label="Mentor feedback" />
            </ResultCallout>
          )}

          <SectionTitle icon={ListChecks} title="Your tasks" />
          {result.tasks.length === 0 ? (
            <EmptyNote message="No tasks were returned." />
          ) : (
            result.tasks.map((task, index) => (
              <Panel key={`${task.title}-${index}`}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {index + 1}. {task.title || "Untitled task"}
                </Text>
                {(task.difficulty !== "" || task.estimatedHours !== null) && (
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {[
                      task.difficulty ? `Difficulty: ${task.difficulty}` : "",
                      task.estimatedHours !== null ? `Estimated: ${task.estimatedHours}h` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
                {task.description !== "" && <MarkdownText content={task.description} />}
                {task.description !== "" && <ListenButton text={task.description} label="Task" />}
                {task.learningOutcomes.length > 0 && (
                  <View style={styles.outcomes}>
                    <Text style={[styles.outcomesLabel, { color: colors.mutedForeground }]}>Learning outcomes</Text>
                    <TagList items={task.learningOutcomes} />
                  </View>
                )}
              </Panel>
            ))
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
  },
  outcomes: {
    gap: spacing.sm,
  },
  outcomesLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
