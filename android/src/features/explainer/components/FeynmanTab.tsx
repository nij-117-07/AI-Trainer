// src/features/explainer/components/FeynmanTab.tsx
/** Feynman: simplify a jargon-heavy idea with metaphors, pitched to an age the user picks. */
import { ScrollView, StyleSheet, View } from "react-native";
import { MessageCircleHeart, Puzzle, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { ResultLoading } from "./ResultLoading";
import { FEYNMAN_AGE, FEYNMAN_DEFAULTS, FEYNMAN_KEY, LIMITS, parseFeynman } from "../lib/drafts";
import { simplifyTopic } from "../lib/generators";

export function useFeynman() {
  return useExplainerTool(FEYNMAN_KEY, FEYNMAN_DEFAULTS, parseFeynman, simplifyTopic);
}

export type FeynmanState = ReturnType<typeof useFeynman>;

export function FeynmanResults({ state }: { state: FeynmanState }) {
  const { result, pending } = state;

  if (pending) {
    return <ResultLoading title="Simplifying your topic" hint="This can take a moment." />;
  }

  if (!result) {
    return (
      <EmptyHint
        icon={Puzzle}
        title="Make it simple"
        hint="Enter a complex topic and pick an age in the form, then tap Simplify it."
      />
    );
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Puzzle} title="Simplified explanation" />
        <MarkdownText content={result.explanation} />
        <ListenButton text={result.explanation} label="Explanation" />
      </Panel>

      {result.keyMetaphors.length > 0 && (
        <Panel>
          <SectionTitle icon={Sparkles} title="Key metaphors" />
          <TagList items={result.keyMetaphors} />
        </Panel>
      )}

      {result.funAnalogy.trim() !== "" && (
        <ResultCallout icon={MessageCircleHeart} title="Fun analogy" tone="amber">
          <MarkdownText content={result.funAnalogy} />
          <ListenButton text={result.funAnalogy} label="Fun analogy" />
        </ResultCallout>
      )}
    </Section>
  );
}

export function FeynmanFooter({ state }: { state: FeynmanState }) {
  const { form, pending, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Complex topic"
          placeholder="e.g. Quantum entanglement"
          value={form.complexTopic}
          onChangeText={(text) => update("complexTopic", text)}
          editable={!pending}
          maxLength={LIMITS.topic}
        />
        <CountSlider
          label="Target age (years)"
          min={FEYNMAN_AGE.min}
          max={FEYNMAN_AGE.max}
          value={form.targetAge}
          onChange={(value) => update("targetAge", value)}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Simplifying…" : "Simplify it"}
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
