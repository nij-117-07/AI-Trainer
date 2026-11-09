// src/features/joke-coach/components/JokeLabTab.tsx
/**
 * Joke Lab: pick a language, get a scenario, write a joke for it, and resubmit until it is scored
 * well. Then ask for a joke of the AI's own or an improved version of yours. The language applies
 * to every AI step.
 */
import { StyleSheet, Text, View } from "react-native";
import { Laugh, Lightbulb, Pencil, RefreshCcw, Send, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import { IMPROVEMENT_GOAL_OPTIONS, JOKE_STYLE_OPTIONS, LANGUAGE_OPTIONS } from "../options";
import { useJokeLab } from "../hooks/useJokeLab";
import { EmptyNote, Label } from "./ResultParts";
import { EvaluationCard, GeneratedJokeCard, ImprovedJokeCard, ScenarioCard } from "./JokeLabResults";

export function JokeLabTab() {
  const colors = useThemeColors();
  const lab = useJokeLab();
  const { state, update, pending, error } = lab;
  const busy = pending !== null;
  const latest = state.attempts[state.attempts.length - 1] ?? null;
  const revising = state.attempts.length > 0;

  function requestNewScenario() {
    if (!revising) {
      void lab.newScenario();
      return;
    }
    confirmAction(
      "Start a new scenario?",
      "Your joke and its scores will be cleared.",
      () => void lab.newScenario(),
      "Start new",
    );
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Sparkles} title="1 · Scenario" />
        <SelectField
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={state.language}
          onChange={(value) => update("language", value)}
          customPlaceholder="e.g. Swahili"
        />
        <TextField
          label="Theme (optional)"
          placeholder="e.g. office life, travel, cooking"
          value={state.theme}
          onChangeText={(text) => update("theme", text)}
          editable={!busy}
          maxLength={200}
        />
        <ActionButton
          label={pending === "scenario" ? "Writing a scenario…" : state.scenario ? "New scenario" : "Generate scenario"}
          icon={Sparkles}
          loading={pending === "scenario"}
          disabled={busy}
          onPress={requestNewScenario}
        />
        {state.scenario ? (
          <ScenarioCard scenario={state.scenario} />
        ) : (
          <EmptyNote message="Choose a language and an optional theme, then the coach will set a scene for your joke." />
        )}
      </Panel>

      {state.scenario ? (
        <Panel>
          <SectionTitle icon={Pencil} title="2 · Your joke" />
          <TextField
            label={revising ? "Revise your joke" : "Your joke"}
            placeholder="Write a joke for this scenario."
            value={state.draft}
            onChangeText={(text) => update("draft", text)}
            editable={!busy}
            multiline
            maxLength={5000}
            voice
          />
          <ActionButton
            label={pending === "evaluate" ? "Scoring your joke…" : revising ? "Resubmit for scoring" : "Submit joke"}
            icon={Send}
            loading={pending === "evaluate"}
            disabled={busy || !state.draft.trim()}
            onPress={lab.submitJoke}
          />
          {state.attempts.length > 1 ? (
            <View style={styles.history}>
              {state.attempts.map((attempt, index) => (
                <Text key={index} style={[styles.historyItem, { color: colors.mutedForeground, borderColor: colors.border }]}>
                  Try {index + 1}: {attempt.evaluation.overallScore.toFixed(1)}/10
                </Text>
              ))}
            </View>
          ) : null}
          {latest ? <EvaluationCard evaluation={latest.evaluation} /> : null}
        </Panel>
      ) : null}

      {latest ? (
        <Panel>
          <SectionTitle icon={Lightbulb} title="3 · What next?" />
          <SelectField
            label="Joke style for a new joke"
            options={JOKE_STYLE_OPTIONS}
            value={state.jokeStyle}
            onChange={(value) => update("jokeStyle", value)}
            allowCustom={false}
          />
          <ActionButton
            label={pending === "joke" ? "Writing a joke…" : "Get a joke"}
            icon={Laugh}
            loading={pending === "joke"}
            disabled={busy}
            onPress={lab.getJoke}
          />
          <View style={styles.goalBlock}>
            <Label>Improve goal</Label>
            <ChoiceChips
              options={IMPROVEMENT_GOAL_OPTIONS}
              value={state.improvementGoal}
              onChange={(value) => update("improvementGoal", value)}
            />
          </View>
          <ActionButton
            label={pending === "improve" ? "Improving your joke…" : "Improve my joke"}
            icon={Sparkles}
            variant="outline"
            loading={pending === "improve"}
            disabled={busy}
            onPress={lab.improveJoke}
          />
          {state.extra?.kind === "joke" ? <GeneratedJokeCard joke={state.extra.joke} /> : null}
          {state.extra?.kind === "improved" ? (
            <ImprovedJokeCard rewrite={state.extra.rewrite} source={state.extra.source} />
          ) : null}
        </Panel>
      ) : null}

      <ErrorText message={error} />
      {state.scenario || state.draft || state.attempts.length > 0 ? (
        <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={lab.reset} />
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  history: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  historyItem: {
    fontSize: 12,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },
  goalBlock: {
    gap: spacing.xs,
  },
});
