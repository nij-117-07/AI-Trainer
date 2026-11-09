// src/features/joke-coach/components/CrowdTab.tsx
/** Crowd simulation mode: predict how an audience will react to a joke. */
import { StyleSheet, Text, View } from "react-native";
import { RefreshCcw, Sparkles, Users } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { VENUE_TYPE_OPTIONS } from "../options";
import { simulateCrowd } from "../lib/generators";
import { JOKE_COACH_STORAGE_KEYS } from "../lib/persistence";
import { useJokeMode } from "../hooks/useJokeMode";
import type { CrowdFormValues, CrowdSimulation } from "../types";
import { BulletList, EmptyNote, Label } from "./ResultParts";

const DEFAULTS: CrowdFormValues = {
  jokeText: "Why do programmers prefer dark mode? Because light attracts bugs.",
  venueType: "open-mic",
  audienceDemographic: "mixed tech crowd, late 20s to 40s",
};

export function CrowdTab() {
  const colors = useThemeColors();
  const mode = useJokeMode<CrowdFormValues, CrowdSimulation>(JOKE_COACH_STORAGE_KEYS.crowd, DEFAULTS, simulateCrowd);
  const { form, update, result, pending } = mode;
  const probability = result ? Math.round(result.laughProbability * 100) : 0;

  return (
    <Section>
      <Panel>
        <TextField
          label="The joke"
          placeholder="Paste the joke you're planning to tell."
          value={form.jokeText}
          onChangeText={(text) => update("jokeText", text)}
          editable={!pending}
          maxLength={5000}
          multiline
          voice
        />
        <SelectField
          label="Venue type"
          options={VENUE_TYPE_OPTIONS}
          value={form.venueType}
          onChange={(value) => update("venueType", value)}
          allowCustom={false}
        />
        <TextField
          label="Audience demographic"
          placeholder="Describe the expected audience."
          value={form.audienceDemographic}
          onChangeText={(text) => update("audienceDemographic", text)}
          editable={!pending}
          maxLength={500}
          voice
        />
        <ActionButton
          label={pending ? "Predicting the reaction…" : "Simulate the crowd"}
          icon={Sparkles}
          loading={pending}
          onPress={mode.run}
        />
      </Panel>

      <ErrorText message={mode.error} />

      {result ? (
        <Panel>
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={[styles.caption, { color: colors.mutedForeground }]}>Predicted response</Text>
              <Text style={[styles.response, { color: colors.foreground }]}>{result.predictedResponse}</Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.percent, { color: colors.foreground }]}>{probability}%</Text>
              <Text style={[styles.caption, { color: colors.mutedForeground }]}>laugh probability</Text>
            </View>
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <View style={[styles.fill, { backgroundColor: colors.primary, width: `${probability}%` }]} />
          </View>
          <Label>Best delivery style</Label>
          {result.bestDeliveryStyle ? (
            <Text style={[styles.text, { color: colors.foreground }]}>{result.bestDeliveryStyle}</Text>
          ) : (
            <EmptyNote message="No delivery advice was returned." />
          )}
          <ListenButton text={result.bestDeliveryStyle} label="Delivery advice" />
          <Label>Potential risks</Label>
          <BulletList items={result.potentialRisks} />
          {result.alternativePunchline ? (
            <View style={[styles.box, { backgroundColor: colors.muted }]}>
              <Label>Backup punchline</Label>
              <MarkdownText content={result.alternativePunchline} />
              <ListenButton text={result.alternativePunchline} label="Backup punchline" />
            </View>
          ) : null}
          <ResultCallout icon={Users} title="Crowd work" tone="amber">
            {result.crowdWorkOpportunity ? (
              <MarkdownText content={result.crowdWorkOpportunity} />
            ) : (
              <EmptyNote message="No crowd-work idea was returned." />
            )}
          </ResultCallout>
        </Panel>
      ) : (
        <EmptyNote message="Paste your joke and pick a venue to predict the reaction." />
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
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  caption: {
    fontSize: 13,
  },
  response: {
    fontSize: 20,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  percent: {
    fontSize: 26,
    fontWeight: "700",
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  box: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
