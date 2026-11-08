// src/features/explainer/components/CurriculumTab.tsx
/** Curriculum Path: a personal plan that connects what the learner knows to today's crux. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Compass, Lightbulb, RefreshCcw, Route, ScrollText, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { buildCurriculum } from "../lib/generators";
import { userLevelOptions } from "../options";
import type { CurriculumFormValues } from "../types";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";

const DEFAULTS: CurriculumFormValues = {
  topic: "Asynchronous Python (asyncio)",
  context: "Official asyncio docs",
  pastLearning: "Comfortable with threads in Python",
  userLevel: "intermediate",
  userHopes: "I want to build a concurrent HTTP fetcher.",
  additionalInstructions: "Use real-world examples.",
};

export function CurriculumTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<CurriculumFormValues>(DEFAULTS);
  const request = useRequest(buildCurriculum);

  function update<K extends keyof CurriculumFormValues>(key: K, value: CurriculumFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  const result = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Main topic"
          placeholder="e.g. Asynchronous Python (asyncio)"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Source material / context"
          placeholder="Paste docs, notes, or raw text…"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!request.pending}
          maxLength={5000}
          multiline
        />
        <TextField
          label="What you already know"
          placeholder="Summarize your current knowledge…"
          value={form.pastLearning}
          onChangeText={(text) => update("pastLearning", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <SelectField
          label="Your level"
          options={userLevelOptions}
          value={form.userLevel}
          onChange={(value) => update("userLevel", value)}
          customPlaceholder="e.g. self-taught"
        />
        <TextField
          label="What you want to achieve today"
          placeholder="e.g. Build a concurrent HTTP fetcher."
          value={form.userHopes}
          onChangeText={(text) => update("userHopes", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <TextField
          label="Additional instructions (optional)"
          placeholder="e.g. Keep it brief."
          value={form.additionalInstructions}
          onChangeText={(text) => update("additionalInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <ActionButton
          label={request.pending ? "Mapping your path…" : "Generate curriculum"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <ResultCallout icon={Lightbulb} title="The crux" tone="emerald">
            <MarkdownText content={result.theCrux} />
          </ResultCallout>

          <ResultCallout icon={ScrollText} title="Rationale" tone="sky">
            <MarkdownText content={result.rationale} />
          </ResultCallout>

          <Panel>
            <SectionTitle icon={Route} title="Learning roadmap" />
            {result.learningRoadmap.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>No roadmap phases returned.</Text>
            ) : (
              <View style={styles.phases}>
                {result.learningRoadmap.map((phase, index) => (
                  <View key={`${phase.phase}-${index}`} style={styles.phase}>
                    <View style={[styles.phaseBadge, { backgroundColor: colors.tone.sky.bg }]}>
                      <Text style={[styles.phaseBadgeText, { color: colors.primary }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.phaseBody}>
                      <Text style={[styles.phaseTitle, { color: colors.foreground }]}>{phase.phase}</Text>
                      <MarkdownText content={phase.description} />
                      {phase.learningObjective ? (
                        <Text style={[styles.objective, { color: colors.primary }]}>
                          Objective: {phase.learningObjective}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Panel>

          <ResultCallout icon={Compass} title="Suggested focus" tone="amber">
            <MarkdownText content={result.suggestedFocus} />
          </ResultCallout>
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
  },
  phases: {
    gap: spacing.lg,
  },
  phase: {
    flexDirection: "row",
    gap: spacing.md,
  },
  phaseBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  phaseBody: {
    flex: 1,
    gap: spacing.sm,
  },
  phaseTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  objective: {
    fontSize: 13,
    lineHeight: 19,
  },
});
