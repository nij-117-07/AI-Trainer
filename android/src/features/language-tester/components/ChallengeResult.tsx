// src/features/language-tester/components/ChallengeResult.tsx
/**
 * Translation challenge round: the prompt and source text, then an answer box as the footer. Checking
 * the answer shows a verdict with what was right and what to improve, and the model answer sits under
 * a disclosure. "Next challenge" then becomes the footer action. Vocabulary and the cultural tip appear
 * only when the user asks for a hint.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowRight, BookOpen, CircleCheck, CircleX, Eye, Globe, Lightbulb, Quote, Target } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResetButton } from "@/components/tool/ResetButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { TagList } from "@/components/tool/TagList";
import { useToolSlots } from "@/components/tool/tool-slots";
import { usePersistedRunState } from "@/hooks/usePersistedRunState";
import { evaluateChallengeAnswer } from "../lib/generators";
import { normalizeChallengeAttempt, SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { errorMessage, oneLine } from "../lib/text";
import { useRunSignal } from "../hooks/useRunSignal";
import type {
  ChallengeAttempt,
  ChallengeEvaluation,
  ChallengeResult as ChallengeResultData,
  TestType,
} from "../types";

const ATTEMPT_KEY = "language-learner.language-tester.challenge.attempt.v1";

const TEST_TYPE_LABELS: Record<TestType, string> = {
  translate_to_target: "Translate into the target language",
  translate_to_native: "Translate into your language",
  explain_meaning: "Explain the meaning",
};

interface ChallengeResultProps {
  result: ChallengeResultData;
  pending: boolean;
  onNext: () => void;
  onReset: () => void;
}

export function ChallengeResult({ result, pending, onNext, onReset }: ChallengeResultProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const nextSignal = useRunSignal();
  const slots = useToolSlots();
  const [saved, setSaved, saveError] = usePersistedRunState<unknown>(ATTEMPT_KEY, JSON.stringify(result), "");
  const attempt = normalizeChallengeAttempt(saved);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const hasHint = result.vocabularyHighlights.length > 0 || result.culturalTip !== "";

  const footerAction = (
    <View style={styles.footer}>
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      {attempt.evaluation ? (
        <ActionButton
          label={pending ? "Creating challenge…" : "Next challenge"}
          icon={ArrowRight}
          loading={pending}
          onPress={onNext}
        />
      ) : (
        <AnswerComposer
          label="Your translation or explanation"
          placeholder="Type your answer"
          value={attempt.text}
          maxLength={2000}
          pending={checking}
          error={checkError}
          submitLabel="Check answer"
          pendingLabel="Checking…"
          onChangeText={(text) => updateAttempt({ text })}
          onSubmit={() => void check()}
        />
      )}
    </View>
  );

  useEffect(() => {
    slots?.setFooter(footerAction);
    return () => slots?.setFooter(null);
  });

  function updateAttempt(next: Partial<ChallengeAttempt>) {
    setSaved((current: unknown) => ({ ...normalizeChallengeAttempt(current), ...next }));
  }

  async function check() {
    const userAttempt = attempt.text.trim();
    if (!userAttempt || checking) return;
    setChecking(true);
    setCheckError(null);
    try {
      const evaluation = await evaluateChallengeAnswer(
        settings,
        {
          challengePrompt: [result.challengeInstruction, result.sourceText].filter((part) => part !== "").join("\n"),
          modelAnswer: result.correctReference,
          userAttempt,
        },
        nextSignal(),
      );
      updateAttempt({ evaluation });
    } catch (err) {
      setCheckError(errorMessage(err, "Failed to check your answer."));
    } finally {
      setChecking(false);
    }
  }

  return (
    <Panel>
      <View style={styles.header}>
        <View style={styles.kind}>
          <Target size={16} color={colors.primary} />
          <Text style={[styles.kindText, { color: colors.mutedForeground }]}>{TEST_TYPE_LABELS[result.testType]}</Text>
        </View>
        <ResetButton onPress={onReset} accessibilityLabel="Reset challenge" />
      </View>

      {result.challengeInstruction !== "" && (
        <View style={styles.block}>
          <MarkdownText content={result.challengeInstruction} />
          <SpeakAndCopy text={result.challengeInstruction} label="Challenge" />
        </View>
      )}

      {result.sourceText !== "" && (
        <ResultCallout icon={Quote} title="Source text" tone="sky">
          <MarkdownText content={result.sourceText.split("\n").map((line) => `> ${line}`).join("\n")} />
          <SpeakAndCopy text={result.sourceText} label="Source text" />
        </ResultCallout>
      )}

      {hintShown && result.vocabularyHighlights.length > 0 && (
        <ResultCallout icon={BookOpen} title="Vocabulary to watch" tone="sky">
          <TagList items={result.vocabularyHighlights} />
        </ResultCallout>
      )}

      {hintShown && result.culturalTip !== "" && (
        <ResultCallout icon={Globe} title="Cultural tip" tone="amber">
          <MarkdownText content={result.culturalTip} />
          <SpeakAndCopy text={result.culturalTip} label="Cultural tip" />
        </ResultCallout>
      )}

      {attempt.evaluation ? (
        <View style={styles.block}>
          <Verdict evaluation={attempt.evaluation} />
          <Disclosure title="Model answer" icon={Eye} summary={oneLine(result.correctReference)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Your answer</Text>
            <Text selectable style={[styles.body, { color: colors.foreground }]}>
              {attempt.text}
            </Text>
            <MarkdownText content={result.correctReference} />
            <SpeakAndCopy text={result.correctReference} label="Model answer" />
          </Disclosure>
        </View>
      ) : (
        hasHint && !hintShown && (
          <ActionButton label="Hint" icon={Lightbulb} variant="outline" onPress={() => setHintShown(true)} />
        )
      )}
    </Panel>
  );
}

function Verdict({ evaluation }: { evaluation: ChallengeEvaluation }) {
  const colors = useThemeColors();
  const correct = evaluation.verdict === "correct";
  return (
    <ResultCallout
      icon={correct ? CircleCheck : CircleX}
      title={correct ? "Correct" : "Not quite"}
      tone={correct ? "emerald" : "rose"}
    >
      {evaluation.whatWasRight !== "" && (
        <Text style={[typeScale.body, { color: colors.foreground }]}>{evaluation.whatWasRight}</Text>
      )}
      {evaluation.improvement !== "" && (
        <Text style={[typeScale.body, { color: colors.mutedForeground }]}>To improve: {evaluation.improvement}</Text>
      )}
    </ResultCallout>
  );
}

function SpeakAndCopy({ text, label }: { text: string; label: string }) {
  return (
    <View style={styles.actions}>
      <ListenButton text={text} label={label} />
      <CopyButton text={text} label={`Copy ${label.toLowerCase()}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  kind: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  kindText: {
    ...typeScale.caption,
  },
  block: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
  },
  label: {
    ...typeScale.label,
    fontWeight: "600",
  },
  body: {
    ...typeScale.body,
  },
});
