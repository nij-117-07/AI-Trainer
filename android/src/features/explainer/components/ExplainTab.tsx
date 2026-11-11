// src/features/explainer/components/ExplainTab.tsx
/** Quick Explain: a structured explanation of a topic plus a one-line takeaway. */
import { ScrollView, StyleSheet, View } from "react-native";
import { Lightbulb, MessageSquareText, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { ResultLoading } from "./ResultLoading";
import { LIMITS, parseQuickExplain, QUICK_EXPLAIN_DEFAULTS, QUICK_EXPLAIN_KEY } from "../lib/drafts";
import { explainTopic } from "../lib/generators";
import { expertiseLevelOptions } from "../options";

export function useQuickExplain() {
  return useExplainerTool(QUICK_EXPLAIN_KEY, QUICK_EXPLAIN_DEFAULTS, parseQuickExplain, explainTopic);
}

export type QuickExplainState = ReturnType<typeof useQuickExplain>;

export function ExplainResults({ state }: { state: QuickExplainState }) {
  const { result, pending } = state;

  if (pending) {
    return <ResultLoading title="Explaining your topic" hint="This can take a moment." />;
  }

  if (!result) {
    return (
      <EmptyHint
        icon={Lightbulb}
        title="Explain any topic"
        hint="Enter a topic in the form, then tap Explain it."
      />
    );
  }

  return (
    <Section>
      {result.keyTakeaway.trim() !== "" && (
        <ResultCallout icon={Lightbulb} title="Key takeaway" tone="emerald">
          <MarkdownText content={result.keyTakeaway} />
        </ResultCallout>
      )}
      <Panel>
        <SectionTitle icon={MessageSquareText} title="Explanation" />
        <MarkdownText content={result.explanation} />
        <ListenButton text={result.explanation} label="Explanation" />
      </Panel>
    </Section>
  );
}

export function ExplainFooter({ state }: { state: QuickExplainState }) {
  const { form, pending, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Topic"
          placeholder="e.g. Quantum entanglement"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={LIMITS.topic}
        />
        <SelectField
          label="Explanation level"
          options={expertiseLevelOptions}
          value={form.explanationLevel}
          onChange={(value) => update("explanationLevel", value)}
          customLabel="Other / custom"
          customPlaceholder="e.g. high-school senior"
        />
        <TextField
          label="Context (optional)"
          placeholder="e.g. Use a cooking analogy"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!pending}
          maxLength={LIMITS.context}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Explaining…" : "Explain it"}
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
