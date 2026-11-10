// src/features/joke-coach/components/JokeLabRoundView.tsx
/**
 * The active scenario in the page body: the scenario, every scored attempt with the latest
 * evaluation, and the coach's extras (a new joke or an improved version). The joke box is in the
 * screen footer (see the route).
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Laugh, Lightbulb, Sparkles, Target } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import { IMPROVEMENT_GOAL_OPTIONS, JOKE_STYLE_OPTIONS } from "../options";
import type { JokeLabRoundState } from "../hooks/useJokeLabRound";
import type { JokeLabRound } from "../types";
import { EvaluationCard, GeneratedJokeCard, ImprovedJokeCard, ScenarioCard } from "./JokeLabResults";
import { EmptyNote, Label } from "./ResultParts";

interface JokeLabRoundViewProps {
  round: JokeLabRound;
  game: JokeLabRoundState;
  onNewScenario: () => void;
}

export function JokeLabRoundView({ round, game, onNewScenario }: JokeLabRoundViewProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const busy = game.pending !== null;
  const latest = round.attempts[round.attempts.length - 1] ?? null;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [round.attempts.length, round.extra, scroll]);

  return (
    <>
      <Panel>
        <SectionTitle icon={Sparkles} title="Scenario" />
        <ScenarioCard scenario={round.scenario} />
        <ActionButton
          label="Start a different scenario"
          icon={Sparkles}
          variant="outline"
          disabled={busy}
          onPress={onNewScenario}
        />
      </Panel>

      <Panel>
        <SectionTitle icon={Target} title="Your attempts" />
        {latest ? (
          <>
            {round.attempts.length > 1 ? (
              <View style={styles.history}>
                {round.attempts.map((attempt, index) => (
                  <Text
                    key={index}
                    style={[styles.historyItem, { color: colors.mutedForeground, borderColor: colors.border }]}
                  >
                    Try {index + 1}: {attempt.evaluation.overallScore.toFixed(1)}/10
                  </Text>
                ))}
              </View>
            ) : null}
            <EvaluationCard evaluation={latest.evaluation} />
          </>
        ) : (
          <EmptyNote message="Write your joke below, then submit it to get it scored." />
        )}
      </Panel>

      {latest ? (
        <Panel>
          <SectionTitle icon={Lightbulb} title="What next?" />
          <SelectField
            label="Joke style for a new joke"
            options={JOKE_STYLE_OPTIONS}
            value={round.jokeStyle}
            onChange={game.setJokeStyle}
            allowCustom={false}
          />
          <ActionButton
            label={game.pending === "joke" ? "Writing a joke…" : "Get a joke"}
            icon={Laugh}
            loading={game.pending === "joke"}
            disabled={busy}
            onPress={() => void game.getJoke()}
          />
          <View style={styles.goalBlock}>
            <Label>Improve goal</Label>
            <ChoiceChips
              options={IMPROVEMENT_GOAL_OPTIONS}
              value={round.improvementGoal}
              onChange={game.setImprovementGoal}
            />
          </View>
          <ActionButton
            label={game.pending === "improve" ? "Improving your joke…" : "Improve my joke"}
            icon={Sparkles}
            variant="outline"
            loading={game.pending === "improve"}
            disabled={busy}
            onPress={() => void game.improveJoke()}
          />
          {round.extra?.kind === "joke" ? <GeneratedJokeCard joke={round.extra.joke} /> : null}
          {round.extra?.kind === "improved" ? (
            <ImprovedJokeCard rewrite={round.extra.rewrite} source={round.extra.source} />
          ) : null}
        </Panel>
      ) : null}
    </>
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
