// src/features/interview/components/DirectiveStage.tsx
/**
 * Step 1: the session manager's decision and directive. The footer holds Ask question (or Save
 * directive while editing). The title row holds the edit pencil, and the body holds Decide again.
 */
import { StyleSheet, Text, View } from "react-native";
import { Pencil, RotateCcw, X } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS, type ChoiceOption } from "../options";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import type { InterviewPending } from "../hooks/useInterviewSession";
import type { Directive, NextAction, SessionDecision } from "../types";
import { BadgeRow, IconAction, StageBadge, StagePanel } from "./StagePanel";

interface DirectiveStageProps {
  decision: SessionDecision;
  edit: InterviewScreen["directive"];
  pending: InterviewPending;
  onRedecide: () => void;
}

const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  new_question: "New question",
  follow_up: "Follow-up",
  switch_topic: "Switch topic",
  end_session: "End session",
};

function labelOf(options: ChoiceOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function DirectiveStage({ decision, edit, pending, onRedecide }: DirectiveStageProps) {
  const colors = useThemeColors();
  const { draft, editing } = edit;
  const busy = pending !== null;

  function set(patch: Partial<Directive>) {
    edit.setDraft((prev) => ({ ...prev, ...patch }));
  }

  const trailing = editing ? (
    <IconAction icon={X} label="Cancel editing directive" onPress={edit.cancel} />
  ) : (
    <IconAction icon={Pencil} label="Edit directive" disabled={busy} onPress={edit.startEdit} />
  );

  const details: Array<[string, string | undefined]> = [
    ["Focus area", draft.focusArea],
    ["Tone guidance", draft.toneGuidance],
    ["Constraints", draft.constraints],
  ];

  return (
    <StagePanel
      label="Next move"
      hint={decision.actionReasoning || undefined}
      isPending={pending === "decide"}
      pendingLabel="Deciding the next move…"
      trailing={trailing}
      actions={
        editing ? undefined : (
          <ActionButton label="Decide again" icon={RotateCcw} variant="outline" disabled={busy} onPress={onRedecide} />
        )
      }
    >
      <BadgeRow>
        <StageBadge label={NEXT_ACTION_LABELS[decision.nextAction] ?? decision.nextAction} tone="sky" />
        {draft.topic ? <StageBadge label={`Topic: ${draft.topic}`} /> : null}
        {draft.difficulty ? <StageBadge label={`Difficulty: ${labelOf(DIFFICULTY_OPTIONS, draft.difficulty)}`} /> : null}
        {draft.questionType ? (
          <StageBadge label={`Type: ${labelOf(QUESTION_TYPE_OPTIONS, draft.questionType)}`} />
        ) : null}
      </BadgeRow>
      <ListenButton text={decision.actionReasoning} label="Next move" />

      {editing ? (
        <View style={styles.form}>
          <TextField label="Topic" value={draft.topic ?? ""} onChangeText={(text) => set({ topic: text })} maxLength={300} />
          <SelectField
            label="Question type"
            options={QUESTION_TYPE_OPTIONS}
            value={draft.questionType ?? "technical"}
            onChange={(value) => set({ questionType: value })}
            allowCustom={false}
          />
          <SelectField
            label="Difficulty"
            options={DIFFICULTY_OPTIONS}
            value={draft.difficulty ?? "medium"}
            onChange={(value) => set({ difficulty: value })}
            allowCustom={false}
          />
          <TextField
            label="Focus area"
            value={draft.focusArea ?? ""}
            onChangeText={(text) => set({ focusArea: text })}
            maxLength={500}
          />
          <TextField
            label="Constraints"
            value={draft.constraints ?? ""}
            onChangeText={(text) => set({ constraints: text })}
            maxLength={1000}
            multiline
            voice
          />
        </View>
      ) : (
        <View style={styles.details}>
          {details.map(([label, value]) =>
            value ? (
              <View key={label} style={styles.detail}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
              </View>
            ) : null,
          )}
        </View>
      )}
    </StagePanel>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  details: {
    gap: spacing.md,
  },
  detail: {
    gap: spacing.xs,
  },
  detailLabel: {
    ...typeScale.caption,
  },
  detailValue: {
    ...typeScale.body,
  },
});
