// src/features/joke-coach/components/PracticeTab.tsx
/** Practice mode: a structured coaching session with a drill for immediate practice. */
import { StyleSheet, Text, View } from "react-native";
import { ListChecks, RefreshCcw, Sparkles, Target } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { PRACTICE_FOCUS_OPTIONS, SKILL_LEVEL_OPTIONS } from "../options";
import { practiceSession } from "../lib/generators";
import { JOKE_COACH_STORAGE_KEYS } from "../lib/persistence";
import { useJokeMode } from "../hooks/useJokeMode";
import type { PracticeFormValues, PracticeSession } from "../types";
import { BulletList, EmptyNote, Label } from "./ResultParts";

const DEFAULTS: PracticeFormValues = {
  currentSkillLevel: "beginner",
  practiceFocus: "writing",
  sessionGoal: "Write a tight five minutes of original material.",
  userJoke: "",
};

export function PracticeTab() {
  const colors = useThemeColors();
  const mode = useJokeMode<PracticeFormValues, PracticeSession>(
    JOKE_COACH_STORAGE_KEYS.practice,
    DEFAULTS,
    practiceSession,
  );
  const { form, update, result, pending } = mode;

  return (
    <Section>
      <Panel>
        <SelectField
          label="Skill level"
          options={SKILL_LEVEL_OPTIONS}
          value={form.currentSkillLevel}
          onChange={(value) => update("currentSkillLevel", value)}
          allowCustom={false}
        />
        <SelectField
          label="Practice focus"
          options={PRACTICE_FOCUS_OPTIONS}
          value={form.practiceFocus}
          onChange={(value) => update("practiceFocus", value)}
          allowCustom={false}
        />
        <TextField
          label="Session goal"
          placeholder="What do you want to achieve in this session?"
          value={form.sessionGoal}
          onChangeText={(text) => update("sessionGoal", text)}
          editable={!pending}
          maxLength={500}
          voice
        />
        <TextField
          label="Your joke (optional)"
          placeholder="Paste a joke to practice with, or leave blank for a generated one."
          value={form.userJoke}
          onChangeText={(text) => update("userJoke", text)}
          editable={!pending}
          maxLength={5000}
          multiline
          voice
        />
        <ActionButton
          label={pending ? "Building your drill…" : "Start practice session"}
          icon={Sparkles}
          loading={pending}
          onPress={mode.run}
        />
      </Panel>

      <ErrorText message={mode.error} />

      {result ? (
        <Panel>
          {result.exerciseType ? (
            <View style={[styles.badge, { backgroundColor: colors.tone.sky.bg, borderColor: colors.tone.sky.border }]}>
              <Text style={[styles.badgeText, { color: colors.tone.sky.fg }]}>{result.exerciseType}</Text>
            </View>
          ) : null}
          <SectionTitle icon={ListChecks} title="Instructions" />
          {result.exerciseInstructions ? (
            <MarkdownText content={result.exerciseInstructions} />
          ) : (
            <EmptyNote message="No instructions were returned." />
          )}
          <ListenButton text={result.exerciseInstructions} label="Instructions" />
          {result.practiceJoke ? (
            <View style={[styles.box, { backgroundColor: colors.muted }]}>
              <Label>Practice joke</Label>
              <MarkdownText content={result.practiceJoke} />
            </View>
          ) : null}
          <ResultCallout icon={Target} title="Drill prompt" tone="emerald">
            {result.drillPrompt ? <MarkdownText content={result.drillPrompt} /> : <EmptyNote message="No drill was returned." />}
            <ListenButton text={result.drillPrompt} label="Drill prompt" />
          </ResultCallout>
          <Label>Success criteria</Label>
          <BulletList items={result.successCriteria} />
          <Label>Next steps</Label>
          <BulletList items={result.nextSteps} numbered />
        </Panel>
      ) : (
        <EmptyNote message="Describe your goal and the coach will design a drill." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={mode.reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  box: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
