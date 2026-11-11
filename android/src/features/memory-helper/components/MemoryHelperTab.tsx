// src/features/memory-helper/components/MemoryHelperTab.tsx
/** Memory Helper: concept-to-hook memory aids, a why-it-works note, and a retention plan. The form and the result are separate pages. */
import { StyleSheet, Text, View } from "react-native";
import { Brain, Lightbulb, ListChecks, Plus, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import type { MemoryHelperState } from "../hooks/useMemoryHelper";
import { techniqueOptions } from "../lib/options";
import { CONTENT_MAX, CONTENT_MIN, isMemoryTechnique } from "../lib/types";

export function MemoryHelperForm({ state }: { state: MemoryHelperState }) {
  const { form, pending, update } = state;

  return (
    <Panel>
      <TextField
        label="Facts to memorize"
        placeholder="e.g. The planets in order from the sun"
        hint={`At least ${CONTENT_MIN} characters.`}
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={CONTENT_MAX}
        multiline
        voice
      />
      <SelectField
        label="Mnemonic technique"
        options={techniqueOptions}
        value={form.technique}
        onChange={(value) => {
          if (isMemoryTechnique(value)) update("technique", value);
        }}
        allowCustom={false}
      />
    </Panel>
  );
}

export function MemoryHelperResults({ state }: { state: MemoryHelperState }) {
  const colors = useThemeColors();
  const { result } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={Brain}
        title="No memory aid yet"
        hint="Describe what to remember, then tap Create memory aid."
      />
    );
  }

  return (
    <Section>
      {result.memoryHooks.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No memory aids returned. Try again.</Text>
      ) : (
        result.memoryHooks.map((item, index) => (
          <Panel key={`${item.concept}-${index}`}>
            <View style={styles.aid}>
              <Text accessibilityRole="header" style={[styles.concept, { color: colors.primary }]}>
                {index + 1}. {item.concept}
              </Text>
              <MarkdownText content={item.hook} />
            </View>
            <View style={styles.actions}>
              <ListenButton text={item.hook} label={`Memory aid ${index + 1}`} />
              <CopyButton text={item.hook} label={`Copy memory aid ${index + 1}`} />
            </View>
          </Panel>
        ))
      )}

      {result.explanation.trim() !== "" && (
        <Disclosure title="Why this works" icon={Lightbulb} summary={firstLine(result.explanation)}>
          <MarkdownText content={result.explanation} />
          <View style={styles.actions}>
            <ListenButton text={result.explanation} label="Explanation" />
            <CopyButton text={result.explanation} label="Copy explanation" />
          </View>
        </Disclosure>
      )}

      {result.retentionPlan.trim() !== "" && (
        <Disclosure title="Review plan" icon={ListChecks} summary={firstLine(result.retentionPlan)}>
          <MarkdownText content={result.retentionPlan} />
          <View style={styles.actions}>
            <ListenButton text={result.retentionPlan} label="Review plan" />
            <CopyButton text={result.retentionPlan} label="Copy review plan" />
          </View>
        </Disclosure>
      )}
    </Section>
  );
}

export function MemoryHelperFooter({ state }: { state: MemoryHelperState }) {
  const { pending, error, submit } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Creating memory aid…" : "Create memory aid"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

export function MemoryHelperResultFooter({ onNew }: { onNew: () => void }) {
  return <ActionButton label="New memory aid" icon={Plus} onPress={onNew} />;
}

/** The first non-empty line of Markdown text, with formatting marks removed, for a one-line summary. */
function firstLine(text: string): string {
  return (
    text
      .split("\n")
      .map((line) => line.replace(/^\s*(?:[-+*#>]|\d+\.)\s*/, "").replace(/[*_`]/g, "").trim())
      .find((line) => line !== "") ?? ""
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  aid: {
    gap: spacing.sm,
  },
  concept: {
    ...typeScale.label,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  empty: {
    ...typeScale.label,
  },
});
