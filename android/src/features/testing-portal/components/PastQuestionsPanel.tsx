// src/features/testing-portal/components/PastQuestionsPanel.tsx
/** Lists the most recent generated questions. They are sent with the next request to avoid repeats. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { Field, Panel } from "@/components/tool/FormControls";

export function PastQuestionsPanel({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <Field
        label={`Past questions (${items.length} of ${PAST_QUESTIONS_LIMIT})`}
        hint="Questions you generate are sent with the next request so the model avoids repeats."
      >
        {items.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No questions generated yet.</Text>
        ) : (
          <View style={styles.list}>
            {items.map((question, index) => (
              <Text
                key={`${index}-${question}`}
                numberOfLines={2}
                style={[styles.item, { color: colors.foreground, borderColor: colors.border }]}
              >
                {index + 1}. {question}
              </Text>
            ))}
          </View>
        )}
      </Field>
    </Panel>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
  },
});
