// src/features/joke-coach/components/RewriteTab.tsx
/** Rewrite mode: sharpen a joke toward one improvement goal. */
import { StyleSheet, Text, View } from "react-native";
import { PenTool, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { IMPROVEMENT_GOAL_OPTIONS } from "../options";
import { rewriteJoke } from "../lib/generators";
import { JOKE_COACH_STORAGE_KEYS } from "../lib/persistence";
import { useJokeMode } from "../hooks/useJokeMode";
import type { RewriteJokeFormValues, RewrittenJoke } from "../types";
import { BulletList, EmptyNote, Label } from "./ResultParts";

const DEFAULTS: RewriteJokeFormValues = {
  originalJoke: "Why do programmers prefer dark mode? Because light attracts bugs.",
  improvementGoal: "shorter",
  targetAudience: "tech workers",
};

export function RewriteTab() {
  const colors = useThemeColors();
  const mode = useJokeMode<RewriteJokeFormValues, RewrittenJoke>(
    JOKE_COACH_STORAGE_KEYS.rewrite,
    DEFAULTS,
    rewriteJoke,
  );
  const { form, update, result, pending } = mode;

  return (
    <Section>
      <Panel>
        <TextField
          label="Original joke"
          placeholder="Paste the joke you want to improve."
          value={form.originalJoke}
          onChangeText={(text) => update("originalJoke", text)}
          editable={!pending}
          maxLength={5000}
          multiline
          voice
        />
        <SelectField
          label="Improvement goal"
          options={IMPROVEMENT_GOAL_OPTIONS}
          value={form.improvementGoal}
          onChange={(value) => update("improvementGoal", value)}
          allowCustom={false}
        />
        <TextField
          label="Target audience"
          placeholder="Who should find this funny?"
          value={form.targetAudience}
          onChangeText={(text) => update("targetAudience", text)}
          editable={!pending}
          maxLength={300}
        />
        <ActionButton
          label={pending ? "Sharpening your joke…" : "Rewrite joke"}
          icon={Sparkles}
          loading={pending}
          onPress={mode.run}
        />
      </Panel>

      <ErrorText message={mode.error} />

      {result ? (
        <Panel>
          <View style={[styles.highlight, { backgroundColor: colors.tone.emerald.bg, borderColor: colors.tone.emerald.border }]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Rewritten joke</Text>
            <MarkdownText content={result.rewrittenJoke || "No rewrite was returned."} />
            <ListenButton text={result.rewrittenJoke} label="Rewritten joke" />
          </View>
          <View style={styles.pair}>
            <View style={[styles.cell, { backgroundColor: colors.muted }]}>
              <Label>Setup</Label>
              <MarkdownText content={result.setup || "—"} />
            </View>
            <View style={[styles.cell, { backgroundColor: colors.muted }]}>
              <Label>Punchline</Label>
              <MarkdownText content={result.punchline || "—"} />
            </View>
          </View>
          <Label>Changes made</Label>
          <BulletList items={result.changesMade} />
          <ResultCallout icon={PenTool} title="Performance notes" tone="amber">
            {result.performanceNotes ? (
              <>
                <MarkdownText content={result.performanceNotes} />
                <ListenButton text={result.performanceNotes} label="Performance notes" />
              </>
            ) : (
              <EmptyNote message="No notes were returned." />
            )}
          </ResultCallout>
        </Panel>
      ) : (
        <EmptyNote message="Paste a joke and pick a goal to sharpen it." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={mode.reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  highlight: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  pair: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
