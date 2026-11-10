// src/features/interview/components/DirectiveStage.tsx
/**
 * Step 1: the session manager's decision and directive. The footer holds Proceed (or Save edits
 * while editing). The body holds Edit directive and Re-decide.
 */
import { StyleSheet, Text, View } from "react-native";
import { Pencil, RotateCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS } from "../options";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import type { InterviewPending } from "../hooks/useInterviewSession";
import type { Directive, SessionDecision } from "../types";
import { BadgeRow, StageBadge, StagePanel } from "./StagePanel";

interface DirectiveStageProps {
  decision: SessionDecision;
  edit: InterviewScreen["directive"];
  pending: InterviewPending;
  onRedecide: () => void;
}

export function DirectiveStage({ decision, edit, pending, onRedecide }: DirectiveStageProps) {
  const colors = useThemeColors();
  const { draft, editing } = edit;
  const busy = pending !== null;

  function set(patch: Partial<Directive>) {
    edit.setDraft((prev) => ({ ...prev, ...patch }));
  }

  const actions = editing ? (
    <ActionButton label="Cancel" variant="outline" onPress={edit.cancel} />
  ) : (
    <>
      <ActionButton label="Edit directive" icon={Pencil} variant="outline" disabled={busy} onPress={edit.startEdit} />
      <ActionButton label="Re-decide" icon={RotateCcw} variant="outline" disabled={busy} onPress={onRedecide} />
    </>
  );

  const details: Array<[string, string | undefined]> = [
    ["Focus area", draft.focusArea],
    ["Tone guidance", draft.toneGuidance],
    ["Constraints", draft.constraints],
  ];

  return (
    <StagePanel
      label="Session manager decision"
      hint={decision.actionReasoning || "The session manager picked the next move."}
      isPending={pending === "decide"}
      pendingLabel="Deciding the next move…"
      actions={actions}
    >
      <BadgeRow>
        <StageBadge label={decision.nextAction} tone="sky" />
        {draft.topic ? <StageBadge label={`topic: ${draft.topic}`} /> : null}
        {draft.difficulty ? <StageBadge label={`difficulty: ${draft.difficulty}`} /> : null}
        {draft.questionType ? <StageBadge label={`type: ${draft.questionType}`} /> : null}
      </BadgeRow>
      <ListenButton text={decision.actionReasoning} label="Decision" />

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
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
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
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 22,
  },
});
