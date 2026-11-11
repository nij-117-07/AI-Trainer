// src/features/testing-portal/components/SolverResultView.tsx
/**
 * The saved solution. The model's answer comes first, with a copy action. The reasoning and the
 * question with its options sit under disclosures, so the page stays short until the user asks.
 */
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, FileText, Lightbulb } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { OPTION_KEYS } from "../types";
import type { SavedSolve } from "../lib/persistence";

export function SolverResultView({ saved }: { saved: SavedSolve }) {
  const colors = useThemeColors();
  const answerText = saved.options[saved.correctOption];

  return (
    <>
      <ResultCallout icon={CircleCheck} title="Model answer" tone="emerald">
        <View style={styles.answerRow}>
          <Text selectable style={[styles.answer, { color: colors.foreground }]}>
            {saved.correctOption}. {answerText}
          </Text>
          <CopyButton text={`${saved.correctOption}. ${answerText}`} label="Copy answer" />
        </View>
      </ResultCallout>

      {saved.reasoning !== "" && (
        <Disclosure title="Reasoning" icon={Lightbulb} summary={saved.reasoning}>
          <Text selectable style={[styles.body, { color: colors.foreground }]}>
            {saved.reasoning}
          </Text>
          <ListenButton text={saved.reasoning} label="Reasoning" />
        </Disclosure>
      )}

      <Disclosure title="Question and options" icon={FileText} summary={saved.question || undefined}>
        {saved.question !== "" && (
          <Text selectable style={[styles.body, { color: colors.foreground }]}>
            {saved.question}
          </Text>
        )}
        {saved.context !== "" && (
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>Context: {saved.context}</Text>
        )}
        <View style={styles.options}>
          {OPTION_KEYS.map((key) => {
            const chosen = key === saved.correctOption;
            const text = saved.options[key];
            return (
              <View
                key={key}
                accessible
                accessibilityLabel={chosen ? `${key}, model answer: ${text}` : `${key}: ${text}`}
                style={[styles.option, { borderColor: chosen ? colors.primary : colors.border }]}
              >
                <Text style={[styles.letter, { color: colors.foreground }]}>{key}</Text>
                <Text style={[styles.body, styles.optionText, { color: colors.foreground }]}>{text}</Text>
                {chosen && <CircleCheck size={18} color={colors.primary} />}
              </View>
            );
          })}
        </View>
      </Disclosure>
    </>
  );
}

const styles = StyleSheet.create({
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  answer: {
    ...typeScale.title,
    flex: 1,
  },
  body: {
    ...typeScale.body,
  },
  caption: {
    ...typeScale.caption,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  letter: {
    ...typeScale.label,
    fontWeight: "600",
    width: spacing.xl,
  },
  optionText: {
    flex: 1,
  },
});
