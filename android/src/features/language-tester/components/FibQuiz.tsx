// src/features/language-tester/components/FibQuiz.tsx
/**
 * Fill-in-the-blank round. Shows one sentence at a time, or all of them. The gap is a slot that
 * shows the typed word, then the verdict. The answer box and Next sentence sit in the screen footer
 * (FibFooter), except in the all-sentences view, where each sentence has its own answer box.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, Lightbulb, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { CardGrid } from "@/components/tool/CardGrid";
import { ChoiceChips, ErrorText, Panel, pointerCursor } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import type { FibEvaluation } from "../types";
import { EmptyNote, ScorePill } from "./QuizParts";
import type { FibMode, FibRound } from "./FibPractice";

const MODES: { value: FibMode; label: string }[] = [
  { value: "step", label: "One at a time" },
  { value: "list", label: "All sentences" },
];

export function FibQuiz({ round }: { round: FibRound }) {
  const { mode, total, checkedCount, index } = round;
  const colors = useThemeColors();

  return (
    <Section>
      <View style={styles.toolbar}>
        <ChoiceChips options={MODES} value={mode} onChange={round.setMode} />
        <ScorePill text={`${checkedCount}/${total} checked`} />
      </View>

      {total === 0 && <EmptyNote message="No sentences were returned. Try generating again." />}

      {mode === "step" && total > 0 && (
        <Panel>
          <StepBar index={index} total={total} onChange={round.goTo} />
          <QuestionBody round={round} index={index} inline={false} />
        </Panel>
      )}

      {mode === "list" && total > 0 && (
        <>
          <ErrorText message={round.error ?? (round.saveError ? "Changes couldn't be saved. They'll try again." : null)} />
          <CardGrid>
            {round.questions.map((_, position) => (
              <Panel key={position}>
                <Text accessibilityRole="header" style={[typeScale.label, { color: colors.mutedForeground }]}>
                  Sentence {position + 1}
                </Text>
                <QuestionBody round={round} index={position} inline />
              </Panel>
            ))}
          </CardGrid>
        </>
      )}
    </Section>
  );
}

export function FibIconButton({
  icon: Icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        pointerCursor,
        { borderColor: colors.border },
        pressed && !disabled && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={20} color={colors.foreground} />
    </Pressable>
  );
}

function StepBar({ index, total, onChange }: { index: number; total: number; onChange: (index: number) => void }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stepBar}>
      <FibIconButton
        icon={ChevronLeft}
        label="Show previous sentence"
        disabled={index === 0}
        onPress={() => onChange(index - 1)}
      />
      <Text style={[typeScale.label, { color: colors.mutedForeground }]}>
        Sentence {index + 1} of {total}
      </Text>
      <FibIconButton
        icon={ChevronRight}
        label="Show next sentence"
        disabled={index >= total - 1}
        onPress={() => onChange(index + 1)}
      />
    </View>
  );
}

interface QuestionBodyProps {
  round: FibRound;
  index: number;
  inline: boolean;
}

function QuestionBody({ round, index, inline }: QuestionBodyProps) {
  const colors = useThemeColors();
  const question = round.questions[index];
  const evaluation = round.feedback[index];
  const answer = round.answers[index] ?? "";
  const hasHint = question.hint !== "" || question.contextClue !== "";
  const hintOpen = hasHint && round.hintsOpen[index] === true;
  const checking = round.pendingIndex === index;
  const [before, after] = splitAtGap(question.sentence);

  return (
    <View style={styles.body}>
      <View style={styles.sentence}>
        {before !== "" && <Text style={[typeScale.title, { color: colors.foreground }]}>{before}</Text>}
        <GapSlot answer={answer} evaluation={evaluation} correctWord={question.correctWord} />
        {after !== "" && <Text style={[typeScale.title, { color: colors.foreground }]}>{after}</Text>}
      </View>

      <View style={styles.actions}>
        {hasHint && (
          <Pressable
            onPress={() => round.toggleHint(index)}
            accessibilityRole="button"
            accessibilityLabel={hintOpen ? "Hide hint" : "Show hint"}
            accessibilityState={{ expanded: hintOpen }}
            style={({ pressed }) => [
              styles.hintButton,
              pointerCursor,
              { borderColor: colors.border, backgroundColor: colors.card },
              pressed && { backgroundColor: colors.muted },
            ]}
          >
            <Lightbulb size={18} color={colors.primary} />
            <Text style={[typeScale.label, { color: colors.foreground }]}>Hint</Text>
          </Pressable>
        )}
        <ListenButton text={question.sentence} label="Sentence" />
      </View>

      {hintOpen && (
        <View style={[styles.hint, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {question.hint !== "" && <Text style={[typeScale.body, { color: colors.foreground }]}>{question.hint}</Text>}
          {question.contextClue !== "" && (
            <Text style={[typeScale.body, styles.italic, { color: colors.mutedForeground }]}>{question.contextClue}</Text>
          )}
        </View>
      )}

      {evaluation && <Verdict evaluation={evaluation} />}

      {inline && evaluation === undefined && (
        <AnswerComposer
          label="Your answer"
          placeholder="Type the missing word…"
          value={answer}
          maxLength={500}
          pending={checking}
          error={null}
          submitLabel="Check answer"
          onChangeText={(text) => round.changeAnswer(index, text)}
          onSubmit={() => void round.check(index)}
        />
      )}
    </View>
  );
}

/** Text before and after the first gap ("____"). */
function splitAtGap(sentence: string): [string, string] {
  const parts = sentence.split(/_{2,}/);
  return [parts[0].trim(), parts.slice(1).join("____").trim()];
}

function GapSlot({
  answer,
  evaluation,
  correctWord,
}: {
  answer: string;
  evaluation: FibEvaluation | undefined;
  correctWord: string;
}) {
  const colors = useThemeColors();
  const typed = answer.trim() !== "";
  const tone = evaluation ? (evaluation.isCorrect ? "emerald" : "rose") : null;
  const palette = tone ? colors.tone[tone] : null;
  const state = evaluation ? (evaluation.isCorrect ? "Correct" : "Not quite") : typed ? "filled" : "empty";
  const Icon = evaluation?.isCorrect ? CircleCheck : CircleX;

  return (
    <View style={styles.gap} accessible accessibilityLabel={`Gap 1, ${state}`}>
      <View
        style={[
          styles.slot,
          {
            borderColor: palette ? palette.border : colors.primary,
            backgroundColor: palette ? palette.bg : colors.card,
          },
        ]}
      >
        {evaluation && palette && <Icon size={18} color={palette.fg} />}
        <Text
          style={[
            typeScale.title,
            {
              color: palette ? palette.fg : typed ? colors.foreground : colors.mutedForeground,
            },
          ]}
        >
          {typed ? answer.trim() : "1"}
        </Text>
      </View>
      {evaluation && !evaluation.isCorrect && (
        <Text style={[typeScale.label, { color: colors.foreground }]}>Answer: {correctWord}</Text>
      )}
    </View>
  );
}

function Verdict({ evaluation }: { evaluation: FibEvaluation }) {
  const colors = useThemeColors();
  return (
    <ResultCallout
      icon={evaluation.isCorrect ? CircleCheck : CircleX}
      title={evaluation.isCorrect ? "Correct" : "Not quite"}
      tone={evaluation.isCorrect ? "emerald" : "rose"}
    >
      {evaluation.feedback !== "" && <Text style={[typeScale.body, { color: colors.foreground }]}>{evaluation.feedback}</Text>}
      {evaluation.improvementTip !== "" && (
        <Text style={[typeScale.body, { color: colors.mutedForeground }]}>Tip: {evaluation.improvementTip}</Text>
      )}
      <ListenButton text={evaluation.feedback} label="Feedback" />
    </ResultCallout>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  body: {
    gap: spacing.lg,
  },
  sentence: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  gap: {
    alignItems: "flex-start",
    gap: spacing.xs,
    maxWidth: "100%",
  },
  slot: {
    minWidth: 96,
    minHeight: touchTarget,
    maxWidth: "100%",
    borderWidth: 2,
    borderRadius: shape.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  hintButton: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.lg,
  },
  hint: {
    borderWidth: 1,
    borderRadius: shape.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  italic: {
    fontStyle: "italic",
  },
});
