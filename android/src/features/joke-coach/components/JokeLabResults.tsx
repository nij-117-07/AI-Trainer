// src/features/joke-coach/components/JokeLabResults.tsx
/** Result cards for the Joke Lab: the scenario, the evaluation of a submitted joke, and the AI's joke or rewrite. */
import { StyleSheet, Text, View } from "react-native";
import { Check, ClipboardCheck, Sparkles, X } from "lucide-react-native";
import { cardPadding, shape, spacing, typeScale, useThemeColors } from "@/theme";
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
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        For: <Text style={{ color: colors.foreground, fontWeight: "600" }}>{scenario.audience}</Text>
      </Text>
    </View>
  );
}

export function EvaluationCard({ evaluation }: { evaluation: JokeEvaluation }) {
  const colors = useThemeColors();
  const recommended = evaluation.isRecommended;
  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <Text style={[styles.overallLabel, { color: colors.foreground }]}>Overall score</Text>
        <View style={[styles.badge, { backgroundColor: recommended ? colors.primary : colors.muted }]}>
          {recommended ? (
            <Check size={14} color={colors.primaryForeground} />
          ) : (
            <X size={14} color={colors.foreground} />
          )}
          <Text style={[styles.badgeText, { color: recommended ? colors.primaryForeground : colors.foreground }]}>
            {recommended ? "Stage-ready" : "Keep polishing"}
          </Text>
        </View>
      </View>
      <Text
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Overall score ${evaluation.overallScore.toFixed(1)} out of 10`}
        style={[styles.overall, { color: colors.foreground }]}
      >
        {evaluation.overallScore.toFixed(1)}
        <Text style={[styles.overallMax, { color: colors.mutedForeground }]}> /10</Text>
      </Text>
      <ScoreBar label="Humor" value={evaluation.humorScore} />
      <ScoreBar label="Originality" value={evaluation.originalityScore} />
      <ScoreBar label="Delivery" value={evaluation.deliveryScore} />
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
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
        <Label>A joke for this scenario</Label>
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
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        Humor: {joke.humorType || "unspecified"} · Delivery difficulty: {joke.difficultyRating}/5
      </Text>
    </View>
  );
}

export function ImprovedJokeCard({ rewrite, source }: { rewrite: RewrittenJoke; source: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        Your joke: <Text style={{ fontStyle: "italic" }}>{source}</Text>
      </Text>
      <View style={[styles.highlight, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Label>Improved version</Label>
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
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.sm,
  },
  title: {
    ...typeScale.title,
  },
  body: {
    ...typeScale.body,
  },
  highlight: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  overallLabel: {
    ...typeScale.body,
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: shape.full,
  },
  badgeText: {
    ...typeScale.body,
    fontWeight: "600",
  },
  overall: {
    ...typeScale.display,
    textAlign: "center",
  },
  overallMax: {
    ...typeScale.title,
    fontWeight: "400",
  },
});
