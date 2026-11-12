// src/features/testing-portal/components/McqQuestionCard.tsx
/**
 * One MCQ with instant right/wrong feedback on option tap, plus "Recheck with AI",
 * which asks the configured model to solve the question. The recheck appears only after an answer,
 * so it never reveals the answer before the user has tried.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CircleCheck, CircleX, ShieldCheck } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { solveMcq } from "../lib/generators";
import { OPTION_KEYS, type McqItem, type OptionKey } from "../types";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SolverResultCard } from "./SolverResultCard";

interface McqQuestionCardProps {
  index: number;
  question: McqItem;
  selected?: OptionKey;
  onSelect: (option: OptionKey) => void;
  contextSetting?: string;
}

export function McqQuestionCard({ index, question, selected, onSelect, contextSetting }: McqQuestionCardProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const recheck = useRequest(solveMcq);

  const revealed = selected !== undefined;

  return (
    <Panel>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.foreground }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.question, { color: colors.foreground }]}>{question.questionText}</Text>
        <ListenButton text={question.questionText} label="Question" />
      </View>

      <View style={styles.options} accessibilityLiveRegion="polite">
        {OPTION_KEYS.map((key) => {
          const isCorrectOption = revealed && key === question.correctAnswer;
          const isWrongPick = revealed && selected === key && key !== question.correctAnswer;
          const verdict = isCorrectOption ? "Correct" : isWrongPick ? "Incorrect" : undefined;
          const borderColor = isCorrectOption ? colors.primary : isWrongPick ? colors.destructive : colors.border;
          return (
            <Pressable
              key={key}
              disabled={revealed}
              onPress={() => onSelect(key)}
              accessibilityRole="button"
              accessibilityLabel={`Option ${key}: ${question.options[key]}${verdict ? `, ${verdict.toLowerCase()}` : ""}`}
              accessibilityState={{ selected: selected === key, disabled: revealed }}
              style={({ pressed }) => [
                styles.option,
                { borderColor, backgroundColor: isCorrectOption ? colors.muted : colors.background },
                pressed && !revealed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.letter, { borderColor }]}>
                <Text style={[styles.letterText, { color: colors.foreground }]}>{key}</Text>
              </View>
              <View style={styles.optionBody}>
                <Text style={[styles.optionText, { color: colors.foreground }]}>{question.options[key]}</Text>
              </View>
              {verdict &&
                (isCorrectOption ? (
                  <CircleCheck size={22} color={colors.primary} />
                ) : (
                  <CircleX size={22} color={colors.destructive} />
                ))}
            </Pressable>
          );
        })}
      </View>

      {revealed && (
        <View style={[styles.recheck, { borderTopColor: colors.border }]}>
          <ActionButton
            label={recheck.pending ? "Rechecking with AI…" : "Recheck with AI"}
            icon={ShieldCheck}
            variant="outline"
            loading={recheck.pending}
            onPress={() =>
              recheck.run(settings, {
                question: question.questionText,
                context: contextSetting ?? "",
                options: question.options,
              })
            }
          />
          <ErrorText message={recheck.error} />
          {recheck.data && <SolverResultCard result={recheck.data} />}
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...typeScale.body,
    fontWeight: "600",
  },
  question: {
    flex: 1,
    ...typeScale.title,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: shape.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  letter: {
    width: 26,
    height: 26,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    ...typeScale.body,
    fontWeight: "600",
  },
  optionBody: {
    flex: 1,
  },
  optionText: {
    ...typeScale.body,
  },
  recheck: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
});
