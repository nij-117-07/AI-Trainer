// src/features/what-to-do-now/components/WhatToDoNowTab.tsx
/** What To Do Now: goals, time, and situation go in the footer; the next actions show above. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ban, Clock, Compass, Flag, Lightbulb, ListChecks } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { WhatToDoNowState } from "../hooks/useWhatToDoNow";
import { EXTRA_INFO_MAX, GOALS_MAX, SITUATION_MAX } from "../lib/validate";
import type { NextAction } from "../types";

export function WhatToDoNowResults({ state }: { state: WhatToDoNowState }) {
  const colors = useThemeColors();
  const { result, pending } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={Compass}
        title={pending ? "Thinking…" : "Decide your next step"}
        hint={pending ? "This can take a moment." : "Describe your goals and how you are doing in the form, then tap What should I do now?"}
      />
    );
  }

  return (
    <Section>
      {result.timeContext.trim() !== "" && (
        <ResultCallout icon={Clock} title="Time check" tone="sky">
          <Text style={[styles.text, { color: colors.foreground }]}>{result.timeContext.trim()}</Text>
        </ResultCallout>
      )}

      <SectionTitle icon={ListChecks} title="Do this now" />
      {result.doNow.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No actions returned. Try again.</Text>
      ) : (
        result.doNow.map((item, index) => <ActionCard key={`${item.action}-${index}`} item={item} index={index} />)
      )}

      {result.avoid.length > 0 && (
        <ResultCallout icon={Ban} title="Avoid right now" tone="rose">
          <TagList items={result.avoid} />
        </ResultCallout>
      )}

      {result.nextCheckpoint.trim() !== "" && (
        <ResultCallout icon={Flag} title="Next checkpoint" tone="emerald">
          <Text style={[styles.text, { color: colors.foreground }]}>{result.nextCheckpoint.trim()}</Text>
        </ResultCallout>
      )}
    </Section>
  );
}

export function WhatToDoNowFooter({ state }: { state: WhatToDoNowState }) {
  const { form, pending, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
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
        <TextField
          label="Additional info (optional)"
          placeholder="Dinner at 19:00. Laptop only."
          value={form.extraInfo}
          onChangeText={(text) => update("extraInfo", text)}
          editable={!pending}
          multiline
          maxLength={EXTRA_INFO_MAX}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Thinking…" : "What should I do now?"}
        icon={Compass}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function ActionCard({ item, index }: { item: NextAction; index: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.action}</Text>
        {item.minutes !== null && (
          <View style={[styles.minutes, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Clock size={12} color={colors.mutedForeground} />
            <Text style={[styles.minutesText, { color: colors.mutedForeground }]}>{item.minutes} min</Text>
          </View>
        )}
      </View>
      {item.goal.trim() !== "" && (
        <View style={styles.row}>
          <Flag size={14} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.goal}</Text>
        </View>
      )}
      {item.reason.trim() !== "" && (
        <View style={styles.row}>
          <Lightbulb size={14} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.reason}</Text>
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  footer: { gap: spacing.md },
  fields: { maxHeight: 340 },
  fieldsContent: { gap: spacing.md },
  text: { fontSize: 15, lineHeight: 23 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  badge: { width: 28, height: 28, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "700" },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  minutes: { flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  minutesText: { fontSize: 12, fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  meta: { flex: 1, fontSize: 14, lineHeight: 21 },
});
