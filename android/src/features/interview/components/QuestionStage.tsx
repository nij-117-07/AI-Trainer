// src/features/interview/components/QuestionStage.tsx
/**
 * Step 2: the question generator's output with reviewer calibration. Gate: Proceed to answer (the
 * wording can be edited first), or Regenerate.
 */
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, RotateCcw, StepForward } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import type { InterviewQuestion } from "../types";
import { useSyncedDraft } from "../hooks/useSyncedDraft";
import { BadgeRow, BulletList, StageBadge, StagePanel } from "./StagePanel";

interface QuestionStageProps {
  question: InterviewQuestion;
  isPending: boolean;
  error: string | null;
  onProceed: (question: string) => void;
  onRegenerate: () => void;
}

export function QuestionStage({ question, isPending, error, onProceed, onRegenerate }: QuestionStageProps) {
  const [draft, setDraft] = useSyncedDraft(question.question);

  return (
    <StagePanel
      step="Step 2"
      label="Interview question"
      isPending={isPending}
      pendingLabel="Crafting the question…"
      error={error}
      actions={
        <>
          <ActionButton
            label="Proceed to answer"
            icon={StepForward}
            loading={isPending}
            onPress={() => {
              const text = draft.trim();
              if (text) onProceed(text);
            }}
          />
          <ActionButton label="Regenerate" icon={RotateCcw} variant="outline" onPress={onRegenerate} />
        </>
      }
    >
      <BadgeRow>
        <StageBadge label={question.topic || "general"} />
        <StageBadge label={question.difficulty} />
        {question.expectedKeywords.slice(0, 5).map((keyword, index) => (
          <StageBadge key={`${index}-${keyword}`} label={keyword} tone="emerald" />
        ))}
      </BadgeRow>

      <TextField
        label="Question wording"
        hint="Edit the generated question directly, or proceed with it as written."
        value={draft}
        onChangeText={setDraft}
        editable={!isPending}
        maxLength={2000}
        multiline
      />

      <CalibrationBlock title="Evaluation criteria" text={question.evaluationCriteria} />
      {question.redFlags.length > 0 ? (
        <CalibrationBlock title={`Red flags (${question.redFlags.length})`}>
          <BulletList items={question.redFlags} />
        </CalibrationBlock>
      ) : null}
      {question.sampleStrongAnswer ? (
        <CalibrationBlock title="What a strong answer looks like" text={question.sampleStrongAnswer} />
      ) : null}
      {question.sampleWeakAnswer ? (
        <CalibrationBlock title="What a weak answer looks like" text={question.sampleWeakAnswer} />
      ) : null}
    </StagePanel>
  );
}

function CalibrationBlock({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.muted }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <ChevronDown size={16} color={colors.mutedForeground} style={open ? styles.flipped : undefined} />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {text ? <Text style={[styles.text, { color: colors.mutedForeground }]}>{text}</Text> : null}
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  flipped: {
    transform: [{ rotate: "180deg" }],
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
  },
});
