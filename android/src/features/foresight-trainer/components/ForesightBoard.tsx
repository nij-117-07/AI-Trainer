// src/features/foresight-trainer/components/ForesightBoard.tsx
/**
 * Scenario page body: the scene, the transcript, and the current decision's options with a custom
 * option. The reasoning box and the commit button are in the footer (ForesightFooter).
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Award, Flag, Timer } from "lucide-react-native";
import { spacing, useThemeColors, radius } from "@/theme";
import { Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { ForesightRunState } from "../hooks/useForesightRun";
import { CUSTOM_CHOICE } from "../hooks/useForesightRun";
import type { ChoiceOption, ForesightSession } from "../types";

interface ForesightBoardProps {
  session: ForesightSession;
  run: ForesightRunState;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ForesightBoard({ session, run }: ForesightBoardProps) {
  const colors = useThemeColors();
  const complete = session.scenarioComplete;
  const customSelected = run.selected === CUSTOM_CHOICE;
  const remaining = session.maxScenes - session.sceneNumber;

  return (
    <View style={styles.stack}>
      <Panel>
        <SectionTitle icon={Flag} title={`Scene ${session.sceneNumber} of ${session.maxScenes}`} />
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          Theme: {session.theme} · Decisions made: {session.decisionHistory.length}
        </Text>
      </Panel>

      {complete && session.progressReport && (
        <ResultCallout icon={Award} title="Scenario complete" tone="emerald">
          <Text style={[styles.body, { color: colors.foreground }]}>
            You finished as {session.progressReport.archetype} ({session.progressReport.skillAssessment}).
          </Text>
          {session.progressReport.recommendedFocus !== "" && (
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              {session.progressReport.recommendedFocus}
            </Text>
          )}
        </ResultCallout>
      )}

      <Panel>
        <SectionTitle icon={Flag} title="Transcript" />
        {session.log.map((entry, index) => (
          <View key={index} style={styles.entry}>
            <Text style={[styles.speaker, { color: colors.mutedForeground }]}>
              {entry.role === "user" ? "You" : "Trainer"}
            </Text>
            <MarkdownText content={entry.content} />
            {entry.role !== "user" && <ListenButton text={entry.content} label="Trainer reply" />}
          </View>
        ))}
      </Panel>

      {!complete && (
        <Panel>
          {session.currentScene.timePressure !== "" && (
            <ResultCallout icon={Timer} title="Time pressure" tone="amber">
              <Text style={[styles.body, { color: colors.foreground }]}>{session.currentScene.timePressure}</Text>
            </ResultCallout>
          )}

          <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
            {session.currentScene.decisionPoint}
          </Text>
          <ListenButton text={session.currentScene.decisionPoint} label="Decision" />

          <View style={styles.options}>
            {session.options.map((option, index) => (
              <OptionCard
                key={`${option.id}-${index}`}
                letter={OPTION_LETTERS[index] ?? String(index + 1)}
                option={option}
                selected={run.selected === option.id}
                disabled={run.pending}
                onPress={() => run.choose(option.id)}
              />
            ))}
          </View>

          <Pressable
            onPress={() => run.choose(CUSTOM_CHOICE)}
            disabled={run.pending}
            accessibilityRole="button"
            accessibilityLabel="Write your own option instead"
            accessibilityState={{ selected: customSelected, disabled: run.pending }}
            style={[
              styles.custom,
              { borderColor: customSelected ? colors.primary : colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.body, { color: colors.foreground }]}>Write your own option instead</Text>
          </Pressable>
          {customSelected && (
            <TextField
              label="Your own option"
              placeholder={session.customOptionPrompt || "Describe the action you would take."}
              value={run.customChoice}
              onChangeText={run.setCustomChoice}
              editable={!run.pending}
              maxLength={300}
              multiline
              voice
            />
          )}

          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {run.choice === ""
              ? "Choose an option. Then explain your reasoning and tap Commit."
              : "Explain your reasoning and tap Commit to send your choice."}
          </Text>
          {remaining > 0 && session.decisionHistory.length > 0 && (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {remaining} scene{remaining === 1 ? "" : "s"} remaining
            </Text>
          )}
          {run.pending && (
            <View
              accessibilityLiveRegion="polite"
              style={[styles.status, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.body, { color: colors.mutedForeground }]}>Working on the next scene…</Text>
            </View>
          )}
        </Panel>
      )}
    </View>
  );
}

interface OptionCardProps {
  letter: string;
  option: ChoiceOption;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function OptionCard({ letter, option, selected, disabled, onPress }: OptionCardProps) {
  const colors = useThemeColors();
  const meta = [option.approachType, option.riskLevel ? `${option.riskLevel} risk` : "", option.timeCost]
    .filter(Boolean)
    .join(" · ");
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${letter}. ${option.title || "Untitled option"}`}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.option,
        { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.muted : colors.card },
      ]}
    >
      <Text style={[styles.optionTitle, { color: colors.foreground }]}>
        {letter}. {option.title || "Untitled option"}
      </Text>
      {option.description !== "" && (
        <Text style={[styles.body, { color: colors.foreground }]}>{option.description}</Text>
      )}
      {option.hiddenTradeoff !== "" && (
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>Tradeoff: {option.hiddenTradeoff}</Text>
      )}
      {meta !== "" && <Text style={[styles.meta, { color: colors.mutedForeground }]}>{meta}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  heading: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  speaker: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  entry: {
    gap: spacing.xs,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  custom: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
