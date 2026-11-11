// src/features/debate/components/DebateTurnFooter.tsx
/**
 * The turn form, pinned to the page footer: which side speaks, how the statement is made, the AI
 * options when it is generated, and the statement box. On a phone the options scroll inside a capped
 * height so the footer stays short; on tablet and desktop they sit in the side panel without a cap.
 */
import { ScrollView, StyleSheet, View } from "react-native";
import { spacing, useLayout } from "@/theme";
import { ChoiceChips, TextField } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { SelectField } from "@/components/tool/SelectField";
import { LIMITS, MODE_CHOICES, SIDE_CHOICES, STRATEGY_OPTIONS } from "../options";
import type { TurnStrategy } from "../types";
import type { DebateSessionState } from "../hooks/useDebateSession";

const FIELDS_MAX_HEIGHT = 300;

export function DebateTurnFooter({ game }: { game: DebateSessionState }) {
  const { draft, busy } = game;
  const { size } = useLayout();
  const sideLabel = draft.side === "pro" ? "Pro" : "Con";
  const ai = draft.mode === "ai";

  const fields = (
    <View style={styles.fields}>
      <ChoiceChips
        options={SIDE_CHOICES}
        value={draft.side}
        onChange={(value) => game.changeDraft("side", value)}
        wrap={false}
      />
      <ChoiceChips options={MODE_CHOICES} value={draft.mode} onChange={(value) => game.changeDraft("mode", value)} />
      {ai && (
        <>
          <TextField
            label="Evidence (optional)"
            placeholder="Facts or data to anchor this turn"
            value={draft.evidence}
            onChangeText={(text) => game.changeDraft("evidence", text)}
            editable={!busy}
            maxLength={LIMITS.evidence}
            voice
          />
          <SelectField
            label="Strategy"
            options={STRATEGY_OPTIONS}
            value={draft.strategy}
            onChange={(value) => game.changeDraft("strategy", value as TurnStrategy)}
            allowCustom={false}
          />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.footer}>
      {size === "phone" ? (
        <ScrollView style={styles.scroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {fields}
        </ScrollView>
      ) : (
        fields
      )}
      <AnswerComposer
        label={ai ? "Direction (optional)" : `${sideLabel} statement`}
        value={draft.text}
        placeholder={ai ? "e.g. attack the cost argument" : `Write the ${sideLabel} statement…`}
        maxLength={ai ? LIMITS.direction : LIMITS.statement}
        pending={busy}
        error={game.error}
        submitLabel={ai ? "Generate turn" : "Add statement"}
        allowEmpty={ai}
        onChangeText={(text) => game.changeDraft("text", text)}
        onSubmit={() => void game.addTurn()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  scroll: {
    maxHeight: FIELDS_MAX_HEIGHT,
  },
  fields: {
    gap: spacing.md,
  },
});
