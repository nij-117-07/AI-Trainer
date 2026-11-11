// src/features/explainer/components/FeynmanTab.tsx
/** Feynman: simplify a jargon-heavy idea with metaphors, pitched to an age the user picks. */
import { StyleSheet, View } from "react-native";
import { MessageCircleHeart, Puzzle, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { CountSlider } from "@/components/tool/CountSlider";
import { Disclosure } from "@/components/tool/Disclosure";
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

export function FeynmanFields({ state }: { state: FeynmanState }) {
  const { form, pending, update } = state;

  return (
    <Panel>
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
    </Panel>
  );
}

export function FeynmanResults({ state }: { state: FeynmanState }) {
  const { result, pending } = state;

  if (pending) {
    return <ResultLoading title="Explaining your topic" hint="This can take a moment." />;
  }

  if (!result) {
    return (
      <EmptyHint
        icon={Puzzle}
        title="No explanation yet"
        hint="Type a complex topic, pick an age, then tap Explain simply."
      />
    );
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Puzzle} title="Simplified explanation" />
        <MarkdownText content={result.explanation} />
        <View style={styles.actions}>
          <ListenButton text={result.explanation} label="Explanation" />
          <CopyButton text={result.explanation} label="Copy explanation" />
        </View>
      </Panel>

      {result.funAnalogy.trim() !== "" && (
        <ResultCallout icon={MessageCircleHeart} title="Fun analogy" tone="amber">
          <MarkdownText content={result.funAnalogy} />
          <View style={styles.actions}>
            <ListenButton text={result.funAnalogy} label="Fun analogy" />
            <CopyButton text={result.funAnalogy} label="Copy fun analogy" />
          </View>
        </ResultCallout>
      )}

      {result.keyMetaphors.length > 0 && (
        <Disclosure title="Key metaphors" icon={Sparkles} summary={result.keyMetaphors.join(", ")}>
          <TagList items={result.keyMetaphors} />
        </Disclosure>
      )}
    </Section>
  );
}

export function FeynmanFooter({ state }: { state: FeynmanState }) {
  const { pending, error, submit } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Explaining…" : "Explain simply"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { gap: spacing.md },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
});
