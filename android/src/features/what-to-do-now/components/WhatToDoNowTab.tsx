/** What To Do Now: enter goals, the time, and your situation, then get the next actions to take. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ban, Clock, Compass, Flag, Lightbulb, ListChecks, RefreshCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useRequest } from "@/hooks/useRequest";
import { whatToDoNow } from "../lib/generators";
import { EXTRA_INFO_MAX, formatDateTime, GOALS_MAX, SITUATION_MAX } from "../lib/validate";
import type { NextAction, WhatToDoNowFormValues, WhatToDoNowResult } from "../types";

function emptyForm(): WhatToDoNowFormValues {
  return { goals: "", dateTime: formatDateTime(new Date()), situation: "", extraInfo: "" };
}

export function WhatToDoNowTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const request = useRequest(whatToDoNow);
  const [form, setForm] = useState<WhatToDoNowFormValues>(emptyForm);

  const update = <K extends keyof WhatToDoNowFormValues>(key: K, value: WhatToDoNowFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function reset() {
    setForm(emptyForm());
    request.reset();
  }

  async function handleGenerate() {
    await request.run(settings, { ...form, dateTime: form.dateTime.trim() });
  }

  const result: WhatToDoNowResult | null = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Your goals"
          hint="One per line. Add deadlines if you have them."
          placeholder={"Finish the Android report by Friday\nLearn React Native navigation"}
          value={form.goals}
          onChangeText={(text) => update("goals", text)}
          editable={!request.pending}
          multiline
          maxLength={GOALS_MAX}
        />
        <TextField
          label="Date and time"
          hint="Format: YYYY-MM-DD HH:mm"
          placeholder="2026-11-09 14:30"
          value={form.dateTime}
          onChangeText={(text) => update("dateTime", text)}
          editable={!request.pending}
        />
        <TextField
          label="Current situation"
          hint="What are you doing now? How do you feel? How much time do you have?"
          placeholder="I have 2 hours free, I'm tired, and I haven't started the report."
          value={form.situation}
          onChangeText={(text) => update("situation", text)}
          editable={!request.pending}
          multiline
          maxLength={SITUATION_MAX}
        />
        <TextField
          label="Additional info"
          hint="Commitments, location, resources, or constraints (optional)."
          placeholder="Dinner at 19:00. Laptop only."
          value={form.extraInfo}
          onChangeText={(text) => update("extraInfo", text)}
          editable={!request.pending}
          multiline
          maxLength={EXTRA_INFO_MAX}
        />
        <ActionButton
          label={request.pending ? "Thinking…" : "What should I do now?"}
          icon={Compass}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.timeContext.trim() !== "" && (
            <ResultCallout icon={Clock} title="Time check" tone="sky">
              <Text style={[styles.text, { color: colors.foreground }]}>{result.timeContext.trim()}</Text>
            </ResultCallout>
          )}

          <SectionTitle icon={ListChecks} title="Do this now" />
          {result.doNow.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No actions returned.</Text>
          ) : (
            result.doNow.map((item, index) => (
              <ActionCard key={`${item.action}-${index}`} item={item} index={index} />
            ))
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
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
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
  text: { fontSize: 15, lineHeight: 23 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "700" },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  minutes: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  minutesText: { fontSize: 12, fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  meta: { flex: 1, fontSize: 14, lineHeight: 21 },
});
