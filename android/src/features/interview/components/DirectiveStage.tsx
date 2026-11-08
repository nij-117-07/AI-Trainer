// src/features/interview/components/DirectiveStage.tsx
/**
 * Step 1: the session manager's decision and directive. Gate: Proceed to the question generator,
 * Edit the directive, or Re-decide.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pencil, RotateCcw, StepForward } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS } from "../options";
import type { Directive, SessionDecision } from "../types";
import { BadgeRow, StageBadge, StagePanel } from "./StagePanel";
import { useSyncedDraft } from "../hooks/useSyncedDraft";

interface DirectiveStageProps {
  decision: SessionDecision;
  isPending: boolean;
  error: string | null;
  onProceed: () => void;
  onEdit: (directive: Directive) => void;
  onRedecide: () => void;
}

export function DirectiveStage({ decision, isPending, error, onProceed, onEdit, onRedecide }: DirectiveStageProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useSyncedDraft(decision.directive);

  function set(patch: Partial<Directive>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    onEdit(draft);
    setEditing(false);
  }

  const actions = editing ? (
    <>
      <ActionButton label="Save edits" icon={Pencil} onPress={save} />
      <ActionButton
        label="Cancel"
        variant="outline"
        onPress={() => {
          setDraft(decision.directive);
          setEditing(false);
        }}
      />
    </>
  ) : (
    <>
      <ActionButton label="Proceed" icon={StepForward} loading={isPending} onPress={onProceed} />
      <ActionButton label="Edit directive" icon={Pencil} variant="outline" onPress={() => setEditing(true)} />
      <ActionButton label="Re-decide" icon={RotateCcw} variant="outline" onPress={onRedecide} />
    </>
  );

  const details: Array<[string, string | undefined]> = [
    ["Focus area", draft.focusArea],
    ["Tone guidance", draft.toneGuidance],
    ["Constraints", draft.constraints],
  ];

  return (
    <StagePanel
      step="Step 1"
      label="Session manager decision"
      hint={decision.actionReasoning || "The session manager picked the next move."}
      isPending={isPending}
      pendingLabel="Deciding the next move…"
      error={error}
      actions={actions}
    >
      <BadgeRow>
        <StageBadge label={decision.nextAction} tone="sky" />
        {draft.topic ? <StageBadge label={`topic: ${draft.topic}`} /> : null}
        {draft.difficulty ? <StageBadge label={`difficulty: ${draft.difficulty}`} /> : null}
        {draft.questionType ? <StageBadge label={`type: ${draft.questionType}`} /> : null}
      </BadgeRow>

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
