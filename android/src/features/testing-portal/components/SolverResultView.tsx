// src/features/testing-portal/components/SolverResultView.tsx
/**
 * The saved solution: the question, its four options, and the model's choice with its reasoning.
 * The chosen option is marked with a border and the words "Model answer", not by colour alone.
 */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import { OPTION_KEYS } from "../types";
import type { SavedSolve } from "../lib/persistence";

export function SolverResultView({ saved }: { saved: SavedSolve }) {
  const colors = useThemeColors();

  return (
    <Panel>
      {saved.question !== "" && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Question</Text>
          <Text selectable style={[styles.question, { color: colors.foreground }]}>
            {saved.question}
          </Text>
          {saved.context !== "" && (
            <Text style={[styles.context, { color: colors.mutedForeground }]}>Context: {saved.context}</Text>
          )}
        </View>
      )}

      <View style={[styles.section, styles.divided, { borderTopColor: colors.border }]}>
        {OPTION_KEYS.map((key) => {
          const chosen = key === saved.correctOption;
          return (
            <View
              key={key}
              style={[styles.option, { borderColor: chosen ? colors.primary : colors.border }]}
            >
              <View style={[styles.letter, { borderColor: chosen ? colors.primary : colors.border }]}>
                <Text style={[styles.letterText, { color: colors.foreground }]}>{key}</Text>
              </View>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{saved.options[key]}</Text>
              {chosen && <Text style={[styles.tag, { color: colors.primary }]}>Model answer</Text>}
            </View>
          );
        })}
      </View>

      <View style={[styles.section, styles.divided, { borderTopColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Reasoning</Text>
        <Text selectable style={[styles.body, { color: colors.mutedForeground }]}>
          {saved.reasoning}
        </Text>
        <ListenButton text={saved.reasoning} label="Reasoning" />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  divided: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "500",
  },
  context: {
    fontSize: 13,
    lineHeight: 19,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  letter: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
  tag: {
    fontSize: 12,
    fontWeight: "600",
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
});
