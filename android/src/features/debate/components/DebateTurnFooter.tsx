// src/features/debate/components/DebateTurnFooter.tsx
/**
 * The turn form, pinned to the page footer. The side is automatic: it is the side that answers the
 * last speaker. Two icon buttons choose between typing the statement and generating it with AI. The
 * AI-only fields sit in a collapsed disclosure so the footer stays short.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pencil, Send, SlidersHorizontal, Sparkles } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { pointerCursor, TextField } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { Disclosure } from "@/components/tool/Disclosure";
import { SelectField } from "@/components/tool/SelectField";
import { LIMITS, STRATEGY_OPTIONS } from "../options";
import type { DebateSide, TurnMode, TurnStrategy } from "../types";
import type { DebateSessionState } from "../hooks/useDebateSession";

const FIELDS_MAX_HEIGHT = 300;

const sideName = (side: DebateSide) => (side === "pro" ? "Pro" : "Con");

export function DebateTurnFooter({ game }: { game: DebateSessionState }) {
  const { draft, busy, side, lastSpeaker } = game;
  const { size } = useLayout();
  const sideLabel = sideName(side);
  const ai = draft.mode === "ai";

  const fields = (
    <View style={styles.fields}>
      <View style={styles.hintRow}>
        <TurnHint
          text={
            lastSpeaker
              ? `Replying to ${sideName(lastSpeaker.side)} (${lastSpeaker.name}). Next: ${sideLabel}.`
              : `${sideLabel} opens the debate.`
          }
        />
        <ModeIcon mode="type" selected={!ai} onPress={() => game.changeDraft("mode", "type")} />
        <ModeIcon mode="ai" selected={ai} onPress={() => game.changeDraft("mode", "ai")} />
      </View>
      {ai && (
        <Disclosure title="AI options" icon={SlidersHorizontal} summary="Evidence and strategy (optional)">
          <View style={styles.aiOptions}>
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
          </View>
        </Disclosure>
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
        submitIcon={ai ? Sparkles : Send}
        allowEmpty={ai}
        onChangeText={(text) => game.changeDraft("text", text)}
        onSubmit={() => void game.addTurn()}
      />
    </View>
  );
}

function TurnHint({ text }: { text: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.hint, typeScale.caption, { color: colors.mutedForeground }]}>{text}</Text>;
}

const MODE_ICONS = { type: Pencil, ai: Sparkles } as const;
const MODE_LABELS: Record<TurnMode, string> = { type: "Type it myself", ai: "Generate with AI" };

function ModeIcon({ mode, selected, onPress }: { mode: TurnMode; selected: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  const Icon = MODE_ICONS[mode];
  const tone = selected ? colors.primaryForeground : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={MODE_LABELS[mode]}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.modeButton,
        pointerCursor,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : pressed ? colors.muted : colors.card,
        },
      ]}
    >
      <Icon size={18} color={tone} />
    </Pressable>
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
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hint: {
    flex: 1,
  },
  modeButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aiOptions: {
    gap: spacing.md,
  },
});
