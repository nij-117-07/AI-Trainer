// src/features/explainer/components/ExplainTab.tsx
/** Quick Explain: a structured explanation of a topic plus a one-line takeaway. */
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Lightbulb, MessageSquareText, Plus, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { ResultLoading } from "./ResultLoading";
import { LIMITS, parseQuickExplain, QUICK_EXPLAIN_DEFAULTS, QUICK_EXPLAIN_KEY } from "../lib/drafts";
import { explainTopic } from "../lib/generators";
import { expertiseLevelOptions } from "../options";

const CUSTOM_LEVEL = "__custom__";
const levelChoices = [...expertiseLevelOptions, { value: CUSTOM_LEVEL, label: "Custom" }];

export function useQuickExplain() {
  return useExplainerTool(QUICK_EXPLAIN_KEY, QUICK_EXPLAIN_DEFAULTS, parseQuickExplain, explainTopic);
}

export type QuickExplainState = ReturnType<typeof useQuickExplain>;

export function ExplainForm({ state }: { state: QuickExplainState }) {
  const { form, pending, update } = state;
  const [customSelected, setCustomSelected] = useState(false);
  const isPreset = expertiseLevelOptions.some((option) => option.value === form.explanationLevel);
  const customMode = !isPreset && (customSelected || form.explanationLevel !== "");

  function pickLevel(choice: string) {
    setCustomSelected(choice === CUSTOM_LEVEL);
    update("explanationLevel", choice === CUSTOM_LEVEL ? "" : choice);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Quantum entanglement"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={LIMITS.topic}
        />
      </Panel>
      <Panel>
        <Field label="Explanation level">
          <ChoiceChips
            options={levelChoices}
            value={customMode ? CUSTOM_LEVEL : form.explanationLevel}
            onChange={pickLevel}
          />
        </Field>
        {customMode && (
          <TextField
            label="Custom level"
            placeholder="e.g. high-school senior"
            value={form.explanationLevel}
            onChangeText={(text) => update("explanationLevel", text)}
            editable={!pending}
            maxLength={LIMITS.level}
          />
        )}
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
      </Panel>
    </Section>
  );
}

export function ExplainResults({ state }: { state: QuickExplainState }) {
  const { result, pending } = state;
  const [takeawayOpen, setTakeawayOpen] = useState(false);

  if (pending) {
    return <ResultLoading title="Explaining your topic" hint="This can take a moment." />;
  }

  if (!result) {
    return <EmptyHint icon={Lightbulb} title="Explain any topic" hint="Tap New explanation to enter a topic." />;
  }

  return (
    <Section>
      <Panel>
        <View style={styles.header}>
          <SectionTitle icon={MessageSquareText} title="Explanation" />
          <View style={styles.actions}>
            <CopyButton text={result.explanation} label="Copy explanation" />
            <ListenButton text={result.explanation} label="Explanation" />
          </View>
        </View>
        <MarkdownText content={result.explanation} />
      </Panel>
      {result.keyTakeaway.trim() !== "" && (
        <Disclosure
          title="Key takeaway"
          icon={Lightbulb}
          summary={takeawayOpen ? undefined : result.keyTakeaway}
          open={takeawayOpen}
          onToggle={setTakeawayOpen}
        >
          <MarkdownText content={result.keyTakeaway} />
        </Disclosure>
      )}
    </Section>
  );
}

export function ExplainFooter({ state }: { state: QuickExplainState }) {
  const { pending, error, submit } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Explaining…" : "Explain topic"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

export function ExplainResultFooter({ onNew }: { onNew: () => void }) {
  return <ActionButton label="New explanation" icon={Plus} onPress={onNew} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  footer: { gap: spacing.md },
});
