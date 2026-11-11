// src/features/foresight-trainer/components/ForesightBoard.tsx
/**
 * Scenario page body: the transcript so far, the open scene with its decision, and the options with
 * a custom option. The chosen option and the reasoning box are in the footer (ForesightFooter).
 * The scene number is shown in the top bar. The newest entry scrolls into view.
 */
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Award, CircleCheck, History, Pencil, Timer } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { ForesightRunState } from "../hooks/useForesightRun";
import { CUSTOM_CHOICE } from "../hooks/useForesightRun";
import { sceneMessage } from "../lib/session";
import type { ChoiceOption, ForesightSession, ScenarioMessage } from "../types";

interface ForesightBoardProps {
  session: ForesightSession;
  run: ForesightRunState;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ForesightBoard({ session, run }: ForesightBoardProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const complete = session.scenarioComplete;
  const customSelected = run.selected === CUSTOM_CHOICE;
  const history = historyOf(session);

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [session.log.length, scroll]);

  return (
    <View style={styles.stack}>
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

      {history.length > 0 && (
        <Panel>
          <SectionTitle icon={History} title="So far" />
          {history.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={[styles.speaker, { color: colors.mutedForeground }]}>
                {entry.role === "user" ? "You" : "Trainer"}
              </Text>
              <MarkdownText content={entry.content} />
              {entry.role !== "user" && <ListenButton text={entry.content} label="Trainer reply" />}
            </View>
          ))}
        </Panel>
      )}

      {!complete && (
        <Panel>
          {session.currentScene.timePressure !== "" && (
            <ResultCallout icon={Timer} title="Time pressure" tone="amber">
              <Text style={[styles.body, { color: colors.foreground }]}>{session.currentScene.timePressure}</Text>
            </ResultCallout>
          )}

          <MarkdownText content={session.currentScene.sceneNarrative} />
          <ListenButton text={session.currentScene.sceneNarrative} label="Scene" />

          <View style={styles.decisionRow}>
            <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
              {session.currentScene.decisionPoint}
            </Text>
            <ListenButton text={session.currentScene.decisionPoint} label="Decision point" />
          </View>

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
            accessibilityLabel="Write your own option"
            accessibilityState={{ selected: customSelected, disabled: run.pending }}
            style={[
              styles.custom,
              { borderColor: customSelected ? colors.primary : colors.border, backgroundColor: colors.card },
            ]}
          >
            <Pencil size={18} color={colors.foreground} />
            <Text style={[styles.body, { color: colors.foreground }]}>Write your own option</Text>
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

/** The transcript without the open scene, which the scene panel shows instead. */
function historyOf(session: ForesightSession): ScenarioMessage[] {
  const last = session.log[session.log.length - 1];
  const sceneOpen =
    !session.scenarioComplete && last?.content === sceneMessage(session.sceneNumber, session.currentScene);
  return sceneOpen ? session.log.slice(0, -1) : session.log;
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
      <View style={styles.optionHeader}>
        <Text style={[styles.optionTitle, { color: colors.foreground }]}>
          {letter}. {option.title || "Untitled option"}
        </Text>
        {selected && <CircleCheck size={18} color={colors.primary} />}
      </View>
      {option.description !== "" && (
        <Text style={[styles.body, { color: colors.foreground }]}>{option.description}</Text>
      )}
      {meta !== "" && <Text style={[styles.meta, { color: colors.mutedForeground }]}>{meta}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  decisionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heading: {
    ...typeScale.title,
    flex: 1,
  },
  meta: {
    ...typeScale.caption,
  },
  body: {
    ...typeScale.body,
  },
  speaker: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  entry: {
    gap: spacing.xs,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  optionTitle: {
    ...typeScale.body,
    flex: 1,
    fontWeight: "600",
  },
  custom: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: shape.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
  },
});
