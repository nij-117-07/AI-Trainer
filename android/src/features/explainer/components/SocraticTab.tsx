// src/features/explainer/components/SocraticTab.tsx
/** Socratic Mentor: discovery questions and hints that guide the learner without giving answers. */
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { HelpCircle, Lightbulb, Sparkles, Target } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { ResultLoading } from "./ResultLoading";
import { LIMITS, parseSocratic, SOCRATIC_DEFAULTS, SOCRATIC_KEY, SOCRATIC_QUESTIONS } from "../lib/drafts";
import { startSocraticSession } from "../lib/generators";
import { expertiseLevelOptions, questionCategoryOptions } from "../options";

export function useSocratic() {
  return useExplainerTool(SOCRATIC_KEY, SOCRATIC_DEFAULTS, parseSocratic, startSocraticSession);
}

export type SocraticState = ReturnType<typeof useSocratic>;

export function SocraticResults({ state }: { state: SocraticState }) {
  const colors = useThemeColors();
  const { result, pending } = state;

  if (pending) {
    return <ResultLoading title="Preparing your questions" hint="This can take a moment." />;
  }

  if (!result) {
    return (
      <EmptyHint
        icon={HelpCircle}
        title="Answer your own questions"
        hint="Enter a topic and paste some material in the form, then tap Start session."
      />
    );
  }

  return (
    <Section>
      {result.pedagogicalGoal.trim() !== "" && (
        <ResultCallout icon={Target} title="Pedagogical goal" tone="sky">
          <MarkdownText content={result.pedagogicalGoal} />
          <ListenButton text={result.pedagogicalGoal} label="Pedagogical goal" />
        </ResultCallout>
      )}

      <SectionTitle icon={HelpCircle} title="Discovery questions" />
      {result.questionsForDiscovery.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          No questions came back. Change the topic or material in the form, then start again.
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
      <Text style={[styles.question, { color: colors.foreground }]}>
        {number}. {questionText}
      </Text>
      <ListenButton text={questionText} label="Question" />
      {cognitiveChallenge.trim() !== "" && (
        <View style={styles.challenge}>
          <Lightbulb size={14} color={colors.mutedForeground} />
          <Text style={[styles.challengeText, { color: colors.mutedForeground }]}>{cognitiveChallenge}</Text>
        </View>
      )}
      {hasHint && (
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
          <Text style={[styles.hintToggleText, { color: colors.foreground }]}>{showHint ? "Hide hint" : "Show hint"}</Text>
        </Pressable>
      )}
      {hasHint && showHint && (
        <View style={[styles.hint, { backgroundColor: colors.muted }]}>
          <Text style={[styles.hintText, { color: colors.foreground }]}>Hint: {guidingHint}</Text>
        </View>
      )}
    </Panel>
  );
}

export function SocraticFooter({ state }: { state: SocraticState }) {
  const { form, pending, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
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
      </ScrollView>
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

const styles = StyleSheet.create({
  footer: { gap: spacing.md },
  fields: { maxHeight: 340 },
  fieldsContent: { gap: spacing.md },
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
  hintToggle: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  hintToggleText: {
    fontSize: 14,
    fontWeight: "600",
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
