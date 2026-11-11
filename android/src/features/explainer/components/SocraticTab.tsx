// src/features/explainer/components/SocraticTab.tsx
/** Socratic Mentor: discovery questions and hints that guide the learner without giving answers. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Lightbulb, Plus, SlidersHorizontal, Sparkles, Target } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SelectField, type SelectOption } from "@/components/tool/SelectField";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { LIMITS, parseSocratic, SOCRATIC_DEFAULTS, SOCRATIC_KEY, SOCRATIC_QUESTIONS } from "../lib/drafts";
import { startSocraticSession } from "../lib/generators";
import { expertiseLevelOptions, questionCategoryOptions } from "../options";

export function useSocratic() {
  return useExplainerTool(SOCRATIC_KEY, SOCRATIC_DEFAULTS, parseSocratic, startSocraticSession);
}

export type SocraticState = ReturnType<typeof useSocratic>;

export function SocraticForm({ state }: { state: SocraticState }) {
  const { form, pending, update } = state;
  const summary = [
    labelOf(expertiseLevelOptions, form.level),
    labelOf(questionCategoryOptions, form.questionCategory),
    `${form.numQuestions} ${form.numQuestions === 1 ? "question" : "questions"}`,
  ].join(", ");

  return (
    <Section>
      <TextField
        label="Topic"
        placeholder="e.g. Supply and demand equilibrium"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={LIMITS.topic}
      />
      <TextField
        label="Context / background material"
        placeholder="Paste the material you want to be quizzed on"
        value={form.context}
        onChangeText={(text) => update("context", text)}
        editable={!pending}
        maxLength={LIMITS.socraticContext}
        multiline
        voice
      />
      <Disclosure title="Options" icon={SlidersHorizontal} summary={summary}>
        <TextField
          label="Special instructions (optional)"
          placeholder="e.g. Focus on real-world pricing examples"
          value={form.userInstructions}
          onChangeText={(text) => update("userInstructions", text)}
          editable={!pending}
          maxLength={LIMITS.instructions}
          multiline
          voice
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
          min={SOCRATIC_QUESTIONS.min}
          max={SOCRATIC_QUESTIONS.max}
          value={form.numQuestions}
          onChange={(value) => update("numQuestions", value)}
        />
      </Disclosure>
    </Section>
  );
}

export function SocraticResults({ state }: { state: SocraticState }) {
  const colors = useThemeColors();
  const { result } = state;

  if (!result) return null;

  return (
    <Section>
      {result.pedagogicalGoal.trim() !== "" && (
        <ResultCallout icon={Target} title="Pedagogical goal" tone="sky">
          <MarkdownText content={result.pedagogicalGoal} />
          <ListenButton text={result.pedagogicalGoal} label="Pedagogical goal" />
        </ResultCallout>
      )}

      {result.questionsForDiscovery.length === 0 ? (
        <Text style={[styles.empty, typeScale.body, { color: colors.mutedForeground }]}>
          No questions came back. Tap New session to try another topic or material.
        </Text>
      ) : (
        result.questionsForDiscovery.map((question, index) => (
          <DiscoveryQuestion
            key={`${question.questionText}-${index}`}
            number={index + 1}
            questionText={question.questionText}
            cognitiveChallenge={question.cognitiveChallenge}
            guidingHint={question.guidingHint}
          />
        ))
      )}
    </Section>
  );
}

function DiscoveryQuestion({
  number,
  questionText,
  cognitiveChallenge,
  guidingHint,
}: {
  number: number;
  questionText: string;
  cognitiveChallenge: string;
  guidingHint: string;
}) {
  const colors = useThemeColors();
  const [showHint, setShowHint] = useState(false);
  const hasHint = guidingHint.trim() !== "";

  return (
    <Panel>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.foreground }]}>
        {number}. {questionText}
      </Text>
      {cognitiveChallenge.trim() !== "" && (
        <Text style={[styles.challenge, { color: colors.mutedForeground }]}>{cognitiveChallenge}</Text>
      )}
      <View style={styles.actions}>
        {hasHint ? (
          <Pressable
            onPress={() => setShowHint((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={`${showHint ? "Hide" : "Show"} hint for question ${number}`}
            accessibilityState={{ expanded: showHint }}
            style={({ pressed }) => [
              styles.hintToggle,
              { borderColor: colors.border },
              pressed && { backgroundColor: colors.muted },
            ]}
          >
            <Lightbulb size={18} color={colors.foreground} />
            <Text style={[styles.hintToggleText, { color: colors.foreground }]}>Hint</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <ListenButton text={questionText} label={`question ${number}`} />
      </View>
      {hasHint && showHint && (
        <View style={[styles.hint, { backgroundColor: colors.muted }]}>
          <Text style={[styles.hintText, { color: colors.foreground }]}>{guidingHint}</Text>
        </View>
      )}
    </Panel>
  );
}

export function SocraticFooter({
  state,
  showForm,
  onNewSession,
}: {
  state: SocraticState;
  showForm: boolean;
  onNewSession: () => void;
}) {
  const { pending, error, submit } = state;

  if (!showForm) {
    return <ActionButton label="New session" icon={Plus} onPress={onNewSession} />;
  }

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Asking questions…" : "Start session"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function labelOf(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

const styles = StyleSheet.create({
  footer: { gap: spacing.md },
  empty: {
    textAlign: "center",
  },
  question: {
    ...typeScale.title,
  },
  challenge: {
    ...typeScale.label,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  hintToggle: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.lg,
  },
  hintToggleText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  hint: {
    borderRadius: shape.md,
    padding: spacing.md,
  },
  hintText: {
    ...typeScale.label,
  },
});
