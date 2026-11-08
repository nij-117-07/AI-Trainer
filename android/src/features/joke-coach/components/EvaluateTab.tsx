// src/features/joke-coach/components/EvaluateTab.tsx
/** Evaluate mode: scores and structured feedback for a joke. */
import { StyleSheet, Text, View } from "react-native";
import { ClipboardCheck, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { evaluateJoke } from "../lib/generators";
import { JOKE_COACH_STORAGE_KEYS } from "../lib/persistence";
import { useJokeMode } from "../hooks/useJokeMode";
import type { EvaluateJokeFormValues, JokeEvaluation } from "../types";
import { BulletList, EmptyNote, Label, ScoreBar } from "./ResultParts";

const DEFAULTS: EvaluateJokeFormValues = {
  jokeText: "Why do programmers prefer dark mode? Because light attracts bugs.",
  intendedAudience: "tech workers",
  context: "open mic night",
};

export function EvaluateTab() {
  const colors = useThemeColors();
  const mode = useJokeMode<EvaluateJokeFormValues, JokeEvaluation>(
    JOKE_COACH_STORAGE_KEYS.evaluate,
    DEFAULTS,
    evaluateJoke,
  );
  const { form, update, result, pending } = mode;

  return (
    <Section>
      <Panel>
        <TextField
          label="The joke"
          placeholder="Paste the complete joke text."
          value={form.jokeText}
          onChangeText={(text) => update("jokeText", text)}
          editable={!pending}
          maxLength={5000}
          multiline
        />
        <TextField
          label="Intended audience"
          placeholder="e.g. general, tech workers"
          value={form.intendedAudience}
          onChangeText={(text) => update("intendedAudience", text)}
          editable={!pending}
          maxLength={300}
        />
        <TextField
          label="Context (optional)"
          placeholder="e.g. open mic night, family dinner"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!pending}
          maxLength={500}
        />
        <ActionButton
          label={pending ? "Scoring your joke…" : "Evaluate joke"}
          icon={Sparkles}
          loading={pending}
          onPress={mode.run}
        />
      </Panel>

      <ErrorText message={mode.error} />

      {result ? (
        <Panel>
          <View style={styles.header}>
            <Text style={[styles.overallLabel, { color: colors.foreground }]}>Overall score</Text>
            <Text style={[styles.badge, { color: result.isRecommended ? colors.primaryForeground : colors.foreground, backgroundColor: result.isRecommended ? colors.primary : colors.muted }]}>
              {result.isRecommended ? "Stage-ready" : "Keep polishing"}
            </Text>
          </View>
          <Text style={[styles.overall, { color: colors.foreground }]}>
            {result.overallScore.toFixed(1)}
            <Text style={[styles.overallMax, { color: colors.mutedForeground }]}> /10</Text>
          </Text>
          <ScoreBar label="Humor" value={result.humorScore} />
          <ScoreBar label="Originality" value={result.originalityScore} />
          <ScoreBar label="Delivery" value={result.deliveryScore} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            Appropriateness: <Text style={{ color: colors.foreground, fontWeight: "600" }}>{result.appropriateness}</Text>
          </Text>
          <Label>Strengths</Label>
          <BulletList items={result.strengths} />
          <Label>Weaknesses</Label>
          <BulletList items={result.weaknesses} />
          <ResultCallout icon={ClipboardCheck} title="Feedback" tone="sky">
            {result.feedback ? <MarkdownText content={result.feedback} /> : <EmptyNote message="No feedback was returned." />}
          </ResultCallout>
        </Panel>
      ) : (
        <EmptyNote message="Paste a joke to get scores and structured feedback." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={mode.reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  overallLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  overall: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
  },
  overallMax: {
    fontSize: 18,
    fontWeight: "400",
  },
  meta: {
    fontSize: 14,
  },
});
