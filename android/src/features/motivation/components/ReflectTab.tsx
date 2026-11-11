// src/features/motivation/components/ReflectTab.tsx
/** Reflection Journal: guided journaling prompts answered one at a time, and one perspective shift. */
import { Text, StyleSheet, View } from "react-native";
import { NotebookPen, Lightbulb, NotebookText, RefreshCw, Sparkles, SlidersHorizontal, ArrowRight, Check } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { Disclosure } from "@/components/tool/Disclosure";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { useRequest } from "@/hooks/useRequest";
import { generateReflection } from "../lib/generators";
import { REFLECTION_DEFAULTS, REFLECTION_DRAFT_KEY, restoreReflectionDraft } from "../lib/drafts";
import {
  isLastStep,
  reflectionPhase,
  stepLabel,
  type ReflectionSession,
} from "../lib/reflection-session";
import type { ReflectionFormValues, ReflectionResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";
import { useReflectionSession } from "../hooks/useReflectionSession";

export function useReflectTab() {
  const { settings } = useAiSettings();
  const draft = useDraft<ReflectionFormValues, ReflectionResult>(
    REFLECTION_DRAFT_KEY,
    REFLECTION_DEFAULTS,
    restoreReflectionDraft,
  );
  const request = useRequest(generateReflection);
  const round = useReflectionSession(draft.result?.prompts ?? []);

  function update<K extends keyof ReflectionFormValues>(key: K, value: ReflectionFormValues[K]) {
    draft.setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    draft.reset();
    request.reset();
    round.reset();
  }

  async function generate() {
    const generated = await request.run(settings, draft.form);
    if (generated) draft.setResult(generated);
  }

  return {
    form: draft.form,
    result: draft.result,
    pending: request.pending,
    error: request.error,
    round: round.session,
    saveError: round.saveError,
    writeAnswer: round.writeAnswer,
    flushAnswer: round.flush,
    submitAnswer: round.submit,
    nextPrompt: round.advance,
    update,
    generate,
    reset,
  };
}

export type ReflectTabState = ReturnType<typeof useReflectTab>;

export function ReflectForm({ state }: { state: ReflectTabState }) {
  const { form, pending, update } = state;

  return (
    <Disclosure title="Mood and goal" icon={SlidersHorizontal} summary={form.currentMood || undefined}>
      <TextField
        label="Current mood"
        placeholder="e.g. Anxious about work."
        value={form.currentMood}
        onChangeText={(text) => update("currentMood", text)}
        editable={!pending}
        maxLength={500}
        multiline
        voice
        style={styles.compactInput}
      />
      <TextField
        label="Goal or value to focus on"
        placeholder="e.g. Creative independence"
        value={form.goalAlignment}
        onChangeText={(text) => update("goalAlignment", text)}
        editable={!pending}
        maxLength={500}
      />
      <TextField
        label="Recent patterns (optional)"
        placeholder="Mood or progress trends from the past week…"
        value={form.recentPatterns}
        onChangeText={(text) => update("recentPatterns", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
        style={styles.compactInput}
      />
    </Disclosure>
  );
}

export function ReflectFooter({ state }: { state: ReflectTabState }) {
  const { pending, error, saveError, round, generate, writeAnswer, flushAnswer, submitAnswer, nextPrompt } = state;
  const phase = reflectionPhase(round);

  if (phase === "answering") {
    return (
      <AnswerComposer
        label="Your answer"
        placeholder="e.g. I felt stuck in the morning, so I took a short walk."
        value={round.answers[round.step]}
        maxLength={1000}
        pending={pending}
        error={saveError}
        submitLabel="Save answer"
        onChangeText={writeAnswer}
        onBlur={flushAnswer}
        onSubmit={submitAnswer}
      />
    );
  }

  const action =
    phase === "saved"
      ? {
          label: isLastStep(round) ? "Finish reflection" : "Next prompt",
          icon: isLastStep(round) ? Check : ArrowRight,
          onPress: nextPrompt,
        }
      : phase === "finished"
        ? { label: pending ? "Reflecting…" : "New reflection", icon: RefreshCw, onPress: generate }
        : { label: pending ? "Reflecting…" : "Generate prompts", icon: Sparkles, onPress: generate };

  return (
    <View style={styles.footer}>
      <ErrorText message={error ?? saveError} />
      <ActionButton label={action.label} icon={action.icon} loading={pending} onPress={action.onPress} />
    </View>
  );
}

export function ReflectResults({ state }: { state: ReflectTabState }) {
  const { result, round } = state;

  if (!result) {
    return <EmptyHint icon={NotebookText} title="No prompts yet" hint="Tap Generate prompts to start." />;
  }

  const phase = reflectionPhase(round);

  return (
    <>
      {phase === "empty" ? (
        <Panel>
          <MarkdownText content="_No prompts returned._" />
        </Panel>
      ) : phase === "finished" ? (
        <ReflectionSummary session={round} />
      ) : (
        <PromptCard session={round} />
      )}
      {result.perspectiveShift.trim() !== "" && (
        <ResultCallout icon={Lightbulb} title="Perspective shift" tone="sky">
          <MarkdownText content={result.perspectiveShift} />
          <ListenButton text={result.perspectiveShift} label="Perspective shift" />
        </ResultCallout>
      )}
    </>
  );
}

function PromptCard({ session }: { session: ReflectionSession }) {
  const colors = useThemeColors();
  const prompt = session.prompts[session.step];
  const saved = reflectionPhase(session) === "saved";

  return (
    <Panel>
      <View style={styles.header}>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>{stepLabel(session)}</Text>
        <ListenButton text={prompt} label="Prompt" />
      </View>
      <Text accessibilityRole="header" style={[styles.prompt, { color: colors.foreground }]}>
        {prompt}
      </Text>
      {saved ? (
        <View style={styles.answer}>
          <Text style={[styles.answerLabel, { color: colors.mutedForeground }]}>Your answer</Text>
          <Text style={[styles.answerText, { color: colors.foreground }]}>{session.answers[session.step]}</Text>
        </View>
      ) : null}
    </Panel>
  );
}

function ReflectionSummary({ session }: { session: ReflectionSession }) {
  const colors = useThemeColors();

  return (
    <Panel>
      <SectionTitle icon={NotebookPen} title="Your reflection" />
      {session.prompts.map((prompt, index) => (
        <View key={index} style={styles.summaryItem}>
          <Text style={[styles.summaryPrompt, { color: colors.mutedForeground }]}>{`${index + 1}. ${prompt}`}</Text>
          <Text style={[styles.summaryAnswer, { color: colors.foreground }]}>{session.answers[index]}</Text>
        </View>
      ))}
    </Panel>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
  },
  compactInput: {
    minHeight: 72,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  counter: {
    ...typeScale.caption,
  },
  prompt: {
    ...typeScale.title,
  },
  answer: {
    gap: spacing.xs,
  },
  answerLabel: {
    ...typeScale.label,
  },
  answerText: {
    ...typeScale.body,
  },
  summaryItem: {
    gap: spacing.xs,
  },
  summaryPrompt: {
    ...typeScale.label,
  },
  summaryAnswer: {
    ...typeScale.body,
  },
});
