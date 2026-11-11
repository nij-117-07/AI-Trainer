// src/features/explainer/components/AtozTab.tsx
/** A-to-Z Tutorial: one cohesive markdown document that covers a topic from basics to mastery. */
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BookOpenText, Plus, Sparkles, X } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { useExplainerTool } from "../hooks/useExplainerTool";
import { TutorialSteps } from "./TutorialSteps";
import { LIMITS, parseTutorial, TUTORIAL_DEFAULTS, TUTORIAL_KEY } from "../lib/drafts";
import { generateTutorial } from "../lib/generators";
import { explanationStyleOptions, expertiseLevelOptions, type ChoiceItem } from "../options";

const CUSTOM = "__custom__";

export function useTutorial() {
  const state = useExplainerTool(TUTORIAL_KEY, TUTORIAL_DEFAULTS, parseTutorial, generateTutorial);
  const [editing, setEditing] = useState(false);
  const { result, pending, error } = state;

  useEffect(() => {
    if (result && !pending && !error) setEditing(false);
  }, [result, pending, error]);

  return {
    ...state,
    editing,
    openForm: () => setEditing(true),
    closeForm: () => setEditing(false),
  };
}

export type TutorialState = ReturnType<typeof useTutorial>;

export function TutorialHeaderActions({ state }: { state: TutorialState }) {
  const colors = useThemeColors();
  if (!state.editing) return null;

  return (
    <View style={styles.headerActions}>
      <ResetButton onPress={state.reset} accessibilityLabel="Reset form" />
      <Pressable
        onPress={state.closeForm}
        accessibilityRole="button"
        accessibilityLabel="Close form"
        style={({ pressed }) => [
          styles.iconButton,
          { borderColor: colors.border },
          pressed && { backgroundColor: colors.muted },
        ]}
      >
        <X size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

export function TutorialForm({ state }: { state: TutorialState }) {
  const { form, pending, update } = state;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. FastAPI architecture"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={LIMITS.topic}
        />
      </Panel>
      <Panel>
        <ChoiceField
          label="Expertise level (optional)"
          customLabel="Custom expertise level"
          options={expertiseLevelOptions}
          value={form.expertiseLevel}
          onChange={(value) => update("expertiseLevel", value)}
          customPlaceholder="e.g. postgraduate"
        />
        <ChoiceField
          label="Explanation style (optional)"
          customLabel="Custom explanation style"
          options={explanationStyleOptions}
          value={form.explanationStyle}
          onChange={(value) => update("explanationStyle", value)}
          customPlaceholder="e.g. history-first"
        />
      </Panel>
    </Section>
  );
}

function ChoiceField({
  label,
  customLabel,
  options,
  value,
  onChange,
  customPlaceholder,
}: {
  label: string;
  customLabel: string;
  options: ChoiceItem[];
  value: string;
  onChange: (value: string) => void;
  customPlaceholder: string;
}) {
  const [customSelected, setCustomSelected] = useState(false);
  const isPreset = options.some((option) => option.value === value);
  const customMode = !isPreset && (customSelected || value !== "");

  function pick(choice: string) {
    if (choice === CUSTOM) {
      setCustomSelected(true);
      onChange("");
      return;
    }
    setCustomSelected(false);
    onChange(choice);
  }

  return (
    <Field label={label}>
      <ChoiceChips
        options={[...options, { value: CUSTOM, label: "Custom" }]}
        value={customMode ? CUSTOM : value}
        onChange={pick}
      />
      {customMode ? (
        <TextField
          label={customLabel}
          placeholder={customPlaceholder}
          value={value}
          onChangeText={onChange}
          maxLength={LIMITS.level}
        />
      ) : null}
    </Field>
  );
}

export function TutorialResults({ state }: { state: TutorialState }) {
  const { result } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={BookOpenText}
        title="No tutorial yet"
        hint="Enter a topic to get a step-by-step tutorial."
      />
    );
  }

  return (
    <Section>
      <View style={styles.actions}>
        <CopyButton text={result.fullExplanation} label="Copy tutorial" />
        <ListenButton text={result.fullExplanation} label="Tutorial" />
      </View>
      <TutorialSteps content={result.fullExplanation} />
    </Section>
  );
}

export function TutorialFooter({ state }: { state: TutorialState }) {
  const { pending, error, submit, openForm, editing } = state;

  if (!editing) {
    return <ActionButton label="New tutorial" icon={Plus} onPress={openForm} />;
  }

  return (
    <View style={styles.footer}>
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
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.md,
  },
});
