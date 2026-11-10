// src/features/explainer/components/AtozTab.tsx
/** A-to-Z Tutorial: one cohesive markdown document that covers a topic from basics to mastery. */
import { ScrollView, StyleSheet, View } from "react-native";
import { BookOpenText, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { LIMITS, parseTutorial, TUTORIAL_DEFAULTS, TUTORIAL_KEY } from "../lib/drafts";
import { generateTutorial } from "../lib/generators";
import { explanationStyleOptions, expertiseLevelOptions } from "../options";

export function useTutorial() {
  return useExplainerTool(TUTORIAL_KEY, TUTORIAL_DEFAULTS, parseTutorial, generateTutorial);
}

export type TutorialState = ReturnType<typeof useTutorial>;

export function TutorialResults({ state }: { state: TutorialState }) {
  const { result } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={BookOpenText}
        title="Write a full tutorial"
        hint="Enter a topic in the form below, then tap Write tutorial."
      />
    );
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={BookOpenText} title="Full A-to-Z tutorial" />
        <MarkdownText content={result.fullExplanation} />
        <ListenButton text={result.fullExplanation} label="Tutorial" />
      </Panel>
    </Section>
  );
}

export function TutorialFooter({ state }: { state: TutorialState }) {
  const { form, pending, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Topic"
          placeholder="e.g. FastAPI architecture"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={LIMITS.topic}
        />
        <SelectField
          label="Expertise level"
          options={expertiseLevelOptions}
          value={form.expertiseLevel}
          onChange={(value) => update("expertiseLevel", value)}
          customPlaceholder="e.g. postgraduate"
        />
        <SelectField
          label="Explanation style"
          options={explanationStyleOptions}
          value={form.explanationStyle}
          onChange={(value) => update("explanationStyle", value)}
          customPlaceholder="e.g. history-first"
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing…" : "Write tutorial"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { gap: spacing.md },
  fields: { maxHeight: 340 },
  fieldsContent: { gap: spacing.md },
});
