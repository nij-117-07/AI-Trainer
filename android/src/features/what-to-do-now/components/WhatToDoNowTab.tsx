// src/features/what-to-do-now/components/WhatToDoNowTab.tsx
/** What To Do Now: the form fields sit in the body and Get next actions in the footer; the result is a checklist of next actions. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ban, Check, Clock, Compass, Flag, Lightbulb, ListChecks } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, pointerCursor, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { WhatToDoNowState } from "../hooks/useWhatToDoNow";
import { EXTRA_INFO_MAX, GOALS_MAX, SITUATION_MAX } from "../lib/validate";
import type { NextAction, WhatToDoNowResult } from "../types";

export function WhatToDoNowForm({ state }: { state: WhatToDoNowState }) {
  const { form, pending, update } = state;
  const [extraOpen, setExtraOpen] = useState(false);

  return (
    <Section>
      <Panel>
        <TextField
          label="Goals"
          placeholder={"Finish the Android report by Friday\nLearn React Native navigation"}
          value={form.goals}
          onChangeText={(text) => update("goals", text)}
          editable={!pending}
          multiline
          maxLength={GOALS_MAX}
          voice
        />
      </Panel>
      <Panel>
        <TextField
          label="Date and time (optional)"
          hint="Leave empty to use now."
          placeholder="2026-11-09 14:30"
          value={form.dateTime}
          onChangeText={(text) => update("dateTime", text)}
          editable={!pending}
        />
        <TextField
          label="Current situation"
          placeholder="I have 2 hours free, I'm tired, and I haven't started the report."
          value={form.situation}
          onChangeText={(text) => update("situation", text)}
          editable={!pending}
          multiline
          maxLength={SITUATION_MAX}
          voice
        />
      </Panel>
      <Disclosure
        title="Additional info (optional)"
        summary={form.extraInfo.trim() || "Commitments, place, or resources"}
        open={extraOpen}
        onToggle={setExtraOpen}
      >
        <TextField
          label="Constraints or context (optional)"
          placeholder="Dinner at 19:00. Laptop only."
          value={form.extraInfo}
          onChangeText={(text) => update("extraInfo", text)}
          editable={!pending}
          multiline
          maxLength={EXTRA_INFO_MAX}
          voice
        />
      </Disclosure>
    </Section>
  );
}

export function WhatToDoNowFooter({ state }: { state: WhatToDoNowState }) {
  const { pending, error, submit } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Getting next actions…" : "Get next actions"}
        icon={Compass}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

export function WhatToDoNowResults({ state, onToggle }: { state: WhatToDoNowState; onToggle: (index: number) => void }) {
  const colors = useThemeColors();
  const { result } = state;

  if (!result) {
    return <EmptyHint icon={Compass} title="No next actions yet" hint="Tap New plan to tell it your goals and time." />;
  }

  const plainText = toPlainText(result);
  const hasReasons = result.doNow.some((item) => item.goal.trim() !== "" || item.reason.trim() !== "");

  return (
    <Section>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <SectionTitle icon={ListChecks} title="Next actions" />
        </View>
        <CopyButton text={plainText} label="Copy next actions" />
        <ListenButton text={plainText} label="next actions" />
      </View>

      {result.doNow.length === 0 ? (
        <Text style={[styles.body, { color: colors.mutedForeground }]}>No actions came back. Tap New plan to try again.</Text>
      ) : (
        <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {result.doNow.map((item, index) => (
            <ActionRow
              key={`${item.action}-${index}`}
              item={item}
              index={index}
              checked={item.done}
              onToggle={() => onToggle(index)}
            />
          ))}
        </View>
      )}

      {hasReasons && (
        <Disclosure title="Why these steps" icon={Lightbulb}>
          <View style={styles.reasons}>
            {result.doNow.map((item, index) => (
              <View key={`why-${item.action}-${index}`} style={styles.reason}>
                <Text style={[styles.body, styles.strong, { color: colors.foreground }]}>
                  {index + 1}. {item.goal.trim() || item.action}
                </Text>
                {item.reason.trim() !== "" && <Text style={[styles.body, { color: colors.mutedForeground }]}>{item.reason}</Text>}
              </View>
            ))}
          </View>
        </Disclosure>
      )}

      {result.timeContext.trim() !== "" && (
        <ResultCallout icon={Clock} title="Time check" tone="sky">
          <Text style={[styles.body, { color: colors.foreground }]}>{result.timeContext.trim()}</Text>
        </ResultCallout>
      )}

      {result.avoid.length > 0 && (
        <ResultCallout icon={Ban} title="Avoid right now" tone="rose">
          <TagList items={result.avoid} />
        </ResultCallout>
      )}

      {result.nextCheckpoint.trim() !== "" && (
        <ResultCallout icon={Flag} title="Next checkpoint" tone="emerald">
          <Text style={[styles.body, { color: colors.foreground }]}>{result.nextCheckpoint.trim()}</Text>
        </ResultCallout>
      )}
    </Section>
  );
}

function ActionRow({
  item,
  index,
  checked,
  onToggle,
}: {
  item: NextAction;
  index: number;
  checked: boolean;
  onToggle: () => void;
}) {
  const colors = useThemeColors();
  const label = `${index + 1}. ${item.action}`;

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        styles.row,
        pointerCursor,
        index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View
        style={[
          styles.box,
          { borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : colors.background },
        ]}
      >
        {checked && <Check size={16} color={colors.primaryForeground} />}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.body, styles.strong, { color: checked ? colors.mutedForeground : colors.foreground }, checked && styles.done]}>
          {label}
        </Text>
        {index === 0 && !checked && <Text style={[styles.caption, { color: colors.primary }]}>Start here</Text>}
        {item.minutes !== null && (
          <View style={[styles.minutes, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Clock size={12} color={colors.mutedForeground} />
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>{item.minutes} min</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function toPlainText(result: WhatToDoNowResult): string {
  const lines = result.doNow.map((item, index) => `${index + 1}. ${item.action}${item.minutes !== null ? ` (${item.minutes} min)` : ""}`);
  if (result.nextCheckpoint.trim() !== "") lines.push("", `Checkpoint: ${result.nextCheckpoint.trim()}`);
  return lines.join("\n");
}

const styles = StyleSheet.create({
  footer: { gap: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerTitle: { flex: 1 },
  list: { borderWidth: 1, borderRadius: shape.lg, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  box: {
    width: 24,
    height: 24,
    marginTop: 1,
    borderWidth: 1,
    borderRadius: shape.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: spacing.xs },
  body: { ...typeScale.body },
  strong: { fontWeight: "600" },
  done: { textDecorationLine: "line-through" },
  caption: { ...typeScale.caption },
  minutes: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reasons: { gap: spacing.lg },
  reason: { gap: spacing.xs },
});
