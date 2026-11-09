// src/features/joke-coach/components/JokeLabResults.tsx
/** Result cards for the Joke Lab: the scenario, the evaluation of a submitted joke, and the AI's joke or rewrite. */
import { StyleSheet, Text, View } from "react-native";
import { ClipboardCheck, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { GeneratedJoke, JokeEvaluation, JokeScenario, RewrittenJoke } from "../types";
import { BulletList, EmptyNote, Label, ScoreBar } from "./ResultParts";

export function ScenarioCard({ scenario }: { scenario: JokeScenario }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{scenario.title}</Text>
      <Text style={[styles.body, { color: colors.foreground }]}>{scenario.situation}</Text>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        For: <Text style={{ color: colors.foreground, fontWeight: "600" }}>{scenario.audience}</Text>
      </Text>
    </View>
  );
}

export function EvaluationCard({ evaluation }: { evaluation: JokeEvaluation }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <Text style={[styles.overallLabel, { color: colors.foreground }]}>Overall score</Text>
        <Text
          style={[
            styles.badge,
            {
              color: evaluation.isRecommended ? colors.primaryForeground : colors.foreground,
              backgroundColor: evaluation.isRecommended ? colors.primary : colors.muted,
            },
          ]}
        >
          {evaluation.isRecommended ? "Stage-ready" : "Keep polishing"}
        </Text>
      </View>
      <Text style={[styles.overall, { color: colors.foreground }]}>
        {evaluation.overallScore.toFixed(1)}
        <Text style={[styles.overallMax, { color: colors.mutedForeground }]}> /10</Text>
      </Text>
      <ScoreBar label="Humor" value={evaluation.humorScore} />
      <ScoreBar label="Originality" value={evaluation.originalityScore} />
      <ScoreBar label="Delivery" value={evaluation.deliveryScore} />
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        Appropriateness: <Text style={{ color: colors.foreground, fontWeight: "600" }}>{evaluation.appropriateness}</Text>
      </Text>
      <Label>Strengths</Label>
      <BulletList items={evaluation.strengths} />
      <Label>Weaknesses</Label>
      <BulletList items={evaluation.weaknesses} />
      <ResultCallout icon={ClipboardCheck} title="Feedback" tone="sky">
        {evaluation.feedback ? <MarkdownText content={evaluation.feedback} /> : <EmptyNote message="No feedback was returned." />}
        <ListenButton text={evaluation.feedback} label="Feedback" />
      </ResultCallout>
    </View>
  );
}

export function GeneratedJokeCard({ joke }: { joke: GeneratedJoke }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      <View style={[styles.highlight, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>A joke for this scenario</Text>
        <MarkdownText content={joke.joke || "No joke text was returned."} />
        <ListenButton text={joke.joke} label="Joke" />
      </View>
      {joke.setup || joke.punchline ? (
        <View style={styles.stack}>
          <Label>Setup</Label>
          <MarkdownText content={joke.setup || "—"} />
          <Label>Punchline</Label>
          <MarkdownText content={joke.punchline || "—"} />
        </View>
      ) : null}
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        Humor: {joke.humorType || "unspecified"} · Delivery difficulty: {joke.difficultyRating}/5
      </Text>
    </View>
  );
}

export function ImprovedJokeCard({ rewrite, source }: { rewrite: RewrittenJoke; source: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={3}>
        Your joke: <Text style={{ fontStyle: "italic" }}>{source}</Text>
      </Text>
      <View style={[styles.highlight, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Improved version</Text>
        <MarkdownText content={rewrite.rewrittenJoke || "No joke text was returned."} />
        <ListenButton text={rewrite.rewrittenJoke} label="Improved joke" />
      </View>
      <Label>What changed</Label>
      <BulletList items={rewrite.changesMade} />
      <ResultCallout icon={Sparkles} title="Performance notes" tone="sky">
        {rewrite.performanceNotes ? <MarkdownText content={rewrite.performanceNotes} /> : <EmptyNote message="No notes were returned." />}
      </ResultCallout>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  highlight: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
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
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    lineHeight: 19,
  },
});
