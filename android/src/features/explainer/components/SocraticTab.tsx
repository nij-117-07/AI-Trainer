// src/features/explainer/components/SocraticTab.tsx
/** Socratic Mentor: discovery questions and hints that guide the learner without giving answers. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HelpCircle, Lightbulb, RefreshCcw, Sparkles, Target } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/features/testing-portal/components/FormControls";
import { CountSlider } from "@/features/testing-portal/components/CountSlider";
import { SelectField } from "@/features/testing-portal/components/SelectField";
import { Section } from "@/features/testing-portal/components/Section";
import { useRequest } from "@/features/testing-portal/hooks/useRequest";
import { startSocraticSession } from "../lib/generators";
import { expertiseLevelOptions, questionCategoryOptions } from "../options";
import type { SocraticFormValues } from "../types";
import { MarkdownText } from "./MarkdownText";
import { ResultCallout } from "./ResultCallout";
import { SectionTitle } from "./SectionTitle";

const MAX_QUESTIONS = 10;

const DEFAULTS: SocraticFormValues = {
  topic: "Supply and Demand Equilibrium",
  context: "Prices are set where quantity supplied equals quantity demanded.",
  userInstructions: "",
  level: "intermediate",
  questionCategory: "counterfactual",
  numQuestions: 3,
};

export function SocraticTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<SocraticFormValues>(DEFAULTS);
  const request = useRequest(startSocraticSession);

  function update<K extends keyof SocraticFormValues>(key: K, value: SocraticFormValues[K]) {
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
          label="Topic"
          placeholder="e.g. Supply and Demand Equilibrium"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Context / background material"
          placeholder="Paste the material you want to be quizzed on…"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!request.pending}
          maxLength={5000}
          multiline
        />
        <TextField
          label="Special instructions (optional)"
          placeholder="e.g. Focus on real-world pricing examples."
          value={form.userInstructions}
          onChangeText={(text) => update("userInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <SelectField
          label="Level"
          options={expertiseLevelOptions}
          value={form.level}
          onChange={(value) => update("level", value)}
          customPlaceholder="e.g. graduate"
        />
        <SelectField
          label="Question category"
          options={questionCategoryOptions}
          value={form.questionCategory}
          onChange={(value) => update("questionCategory", value)}
          customPlaceholder="e.g. analogy-first"
        />
        <CountSlider
          label="Number of questions"
          max={MAX_QUESTIONS}
          value={form.numQuestions}
          onChange={(value) => update("numQuestions", value)}
        />
        <ActionButton
          label={request.pending ? "Asking questions…" : "Start Socratic session"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <ResultCallout icon={Target} title="Pedagogical goal" tone="sky">
            <MarkdownText content={result.pedagogicalGoal} />
          </ResultCallout>

          <SectionTitle icon={HelpCircle} title="Discovery questions" />
          {result.questionsForDiscovery.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No questions returned.</Text>
          ) : (
            result.questionsForDiscovery.map((question, index) => (
              <Panel key={`${question.questionText}-${index}`}>
                <Text style={[styles.question, { color: colors.foreground }]}>
                  {index + 1}. {question.questionText}
                </Text>
                {question.cognitiveChallenge ? (
                  <View style={styles.challenge}>
                    <Lightbulb size={14} color={colors.mutedForeground} />
                    <Text style={[styles.challengeText, { color: colors.mutedForeground }]}>
                      {question.cognitiveChallenge}
                    </Text>
                  </View>
                ) : null}
                {question.guidingHint ? (
                  <View style={[styles.hint, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.hintText, { color: colors.foreground }]}>Hint: {question.guidingHint}</Text>
                  </View>
                ) : null}
              </Panel>
            ))
          )}
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
  question: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 23,
  },
  challenge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  challengeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
