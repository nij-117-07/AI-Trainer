// src/features/confidence-builder/components/ActiveRound.tsx
/**
 * The round in progress. Three stages: rate your confidence, do the task, then rate again and save.
 * The footer holds the one primary action for the stage. Dropping the task is always available.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CircleCheck, Flag, Trash2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Field, pointerCursor, TextField } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { ConfidenceBuilderState } from "../hooks/useConfidenceBuilder";
import { ratingOptions } from "../options";
import { REFLECTION_MAX } from "../lib/validate";
import type { ActiveRound as Round, Rating } from "../types";
import { NumberedSteps } from "./TaskPicker";

export type RoundStage = "before" | "doing" | "reflect";

export function roundStage(round: Round): RoundStage {
  if (round.before === null) return "before";
  return round.doneAt === null ? "doing" : "reflect";
}

export function ActiveRoundBody({ state, round }: { state: ConfidenceBuilderState; round: Round }) {
  const colors = useThemeColors();
  const stage = roundStage(round);

  return (
    <View style={styles.body}>
      <Text accessibilityRole="header" style={[typeScale.headline, { color: colors.foreground }]}>
        {round.task.title}
      </Text>
      {round.task.why !== "" && <Text style={[typeScale.bodyLarge, { color: colors.foreground }]}>{round.task.why}</Text>}

      {stage === "before" && (
        <RatingField
          label="How confident do you feel about this task now?"
          value={round.before}
          onChange={state.rate}
        />
      )}

      {stage === "doing" && (
        <>
          <SectionTitle icon={Flag} title="Steps" />
          <NumberedSteps items={round.task.steps} />
          {round.task.successSign !== "" && (
            <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
              You will know it worked when: {round.task.successSign}
            </Text>
          )}
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
            You started at confidence {round.before}. Tap I did it when you finish.
          </Text>
        </>
      )}

      {stage === "reflect" && (
        <>
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>Before: confidence {round.before} of 5</Text>
          <RatingField label="How confident do you feel now?" value={round.after} onChange={state.rate} />
          <TextField
            label="What happened? (optional)"
            placeholder="e.g. I asked, and the answer helped"
            value={round.reflection}
            onChangeText={state.changeReflection}
            maxLength={REFLECTION_MAX}
            multiline
            voice
          />
        </>
      )}
    </View>
  );
}

export function ActiveRoundFooter({ state, round }: { state: ConfidenceBuilderState; round: Round }) {
  const stage = roundStage(round);

  return (
    <View style={styles.footer}>
      <ErrorText message={state.saveError} />
      {stage === "doing" && <ActionButton label="I did it" icon={CircleCheck} onPress={state.markTaskDone} />}
      {stage === "reflect" && (
        <ActionButton
          label="Save to history"
          icon={CircleCheck}
          disabled={round.after === null}
          onPress={state.saveRound}
        />
      )}
      <ActionButton label="Drop this task" icon={Trash2} variant="outline" onPress={state.dropTask} />
    </View>
  );
}

function RatingField({ label, value, onChange }: { label: string; value: Rating | null; onChange: (rating: Rating) => void }) {
  const colors = useThemeColors();
  return (
    <Field label={label}>
      <View style={styles.ratings} accessibilityRole="radiogroup">
        {ratingOptions.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={`Confidence ${option.value} of 5`}
              accessibilityState={{ selected }}
              style={[
                styles.rating,
                pointerCursor,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : colors.card,
                },
              ]}
            >
              <Text style={[typeScale.label, { color: selected ? colors.primaryForeground : colors.foreground }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>1 is not confident, 5 is very confident.</Text>
    </Field>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  ratings: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rating: {
    flex: 1,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
