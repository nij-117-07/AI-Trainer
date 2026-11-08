// src/features/foresight-trainer/components/ForesightBoard.tsx
/**
 * The running Foresight scenario: the transcript, the current decision with its options, a custom
 * option, and the reasoning that the model will evaluate. Remounted for each scene.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Award, Flag, Timer } from "lucide-react-native";
import { spacing, useThemeColors, radius } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { ChoiceOption, ForesightSession } from "../types";

interface ForesightBoardProps {
  session: ForesightSession;
  pending: boolean;
  error: string | null;
  onDecide: (choice: string, reasoning: string) => Promise<boolean>;
}

const CUSTOM = "__custom__";
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ForesightBoard({ session, pending, error, onDecide }: ForesightBoardProps) {
  const colors = useThemeColors();
  const [selected, setSelected] = useState<string | null>(null);
  const [customChoice, setCustomChoice] = useState("");
  const [reasoning, setReasoning] = useState("");

  const complete = session.scenarioComplete;
  const customSelected = selected === CUSTOM;
  const choice = customSelected ? customChoice.trim() : (selected ?? "");
  const canSubmit = choice.length > 0 && reasoning.trim().length > 0 && !pending;
  const remaining = session.maxScenes - session.sceneNumber;

  async function submit() {
    if (!canSubmit) return;
    const sent = await onDecide(choice, reasoning.trim());
    if (sent) {
      setReasoning("");
      setCustomChoice("");
      setSelected(null);
    }
  }

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

          <Text style={[styles.heading, { color: colors.foreground }]}>{session.currentScene.decisionPoint}</Text>

          <View style={styles.options}>
            {session.options.map((option, index) => (
              <OptionCard
                key={`${option.id}-${index}`}
                letter={OPTION_LETTERS[index] ?? String(index + 1)}
                option={option}
                selected={selected === option.id}
                disabled={pending}
                onPress={() => setSelected(option.id)}
              />
            ))}
          </View>

          <Pressable
            onPress={() => setSelected(CUSTOM)}
            disabled={pending}
            accessibilityRole="button"
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
              value={customChoice}
              onChangeText={setCustomChoice}
              editable={!pending}
              maxLength={300}
              multiline
            />
          )}

          <TextField
            label="Your reasoning (the AI will evaluate this)"
            placeholder="Walk through your trade-offs: who is affected, what could backfire, what are the second-order effects?"
            value={reasoning}
            onChangeText={setReasoning}
            editable={!pending}
            maxLength={2000}
            multiline
          />

          <ActionButton
            label={pending ? "Weighing your decision…" : "Commit to this decision"}
            icon={Flag}
            loading={pending}
            onPress={submit}
          />
          {!pending && !canSubmit && (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Choose an option and explain your reasoning to continue.
            </Text>
          )}
          {!pending && session.decisionHistory.length > 0 && (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {remaining} scene{remaining === 1 ? "" : "s"} remaining
            </Text>
          )}
          <ErrorText message={error} />
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
      accessibilityState={{ selected }}
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
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
