// src/features/subtopic-lister/components/SubtopicFormScreen.tsx
/**
 * Subtopic Lister form page. The fields sit in the body and the footer holds only the error and the
 * one action. A suggestion that succeeds returns to the result page. The finished items shown below
 * the fields are sent with the request.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { TagList } from "@/components/tool/TagList";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useGoBack } from "@/lib/navigation";
import { useSubtopicLister, type SubtopicListerState } from "../hooks/useSubtopicLister";
import { INSTRUCTIONS_MAX, isSubtopicLevel, subtopicLevelOptions, TOPIC_MAX } from "../options";
import type { LearnedTopic } from "../types";

export function SubtopicFormScreen() {
  const goBack = useGoBack();
  const lister = useSubtopicLister();

  async function suggest() {
    if (await lister.suggest()) goBack();
  }

  return (
    <ToolScreen
      title="New subtopics"
      headerRight={<ResetButton onPress={lister.reset} accessibilityLabel="Reset form and results" />}
      footer={<SubtopicFooter lister={lister} onSuggest={suggest} />}
    >
      <SubtopicFields lister={lister} />
    </ToolScreen>
  );
}

function SubtopicFields({ lister }: { lister: SubtopicListerState }) {
  const { form, learned, pending, update } = lister;

  return (
    <>
      <Panel>
        <TextField
          label="Topic you learned (optional)"
          hint="Leave empty to continue from what you have finished."
          placeholder="e.g. Machine learning"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Level"
          options={subtopicLevelOptions}
          value={form.level}
          onChange={(value) => {
            if (isSubtopicLevel(value)) update("level", value);
          }}
          allowCustom={false}
        />
        <TextField
          label="What you know so far (optional)"
          placeholder="e.g. I just finished loops. Or prefer examples over theory."
          value={form.instructions}
          onChangeText={(text) => update("instructions", text)}
          editable={!pending}
          maxLength={INSTRUCTIONS_MAX}
          multiline
          voice
          style={styles.compactInput}
        />
      </Panel>
      <FinishedPanel learned={learned} />
    </>
  );
}

function SubtopicFooter({ lister, onSuggest }: { lister: SubtopicListerState; onSuggest: () => void }) {
  const { pending, error } = lister;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding subtopics…" : "Suggest subtopics"}
        icon={Sparkles}
        loading={pending}
        onPress={onSuggest}
      />
    </View>
  );
}

function FinishedPanel({ learned }: { learned: LearnedTopic[] | null }) {
  const colors = useThemeColors();
  if (learned === null) return null;

  return (
    <Panel>
      <SectionTitle icon={BookOpen} title="Finished in your roadmaps" />
      {learned.length === 0 ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Nothing is marked done yet. Tick items off in your roadmaps.
        </Text>
      ) : (
        learned.map((topic) => (
          <View key={topic.subject} style={styles.topic}>
            <Text style={[styles.subject, { color: colors.foreground }]}>{topic.subject}</Text>
            <TagList items={topic.items} />
          </View>
        ))
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  compactInput: {
    minHeight: 72,
  },
  footer: {
    gap: spacing.md,
  },
  topic: {
    gap: spacing.sm,
  },
  subject: {
    ...typeScale.label,
    fontWeight: "600",
  },
  hint: {
    ...typeScale.label,
    fontWeight: "400",
  },
});
