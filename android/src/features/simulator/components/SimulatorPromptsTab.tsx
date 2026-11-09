// src/features/simulator/components/SimulatorPromptsTab.tsx
/**
 * Persona prompt library. Lists the built-in and saved prompts, and creates or updates one by name.
 * Saved prompts live on the device; there is no delete, as in the webui.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpenCheck, Pencil, Plus, Save } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import { checkPromptValues } from "../lib/prompt-model";
import type { PromptFormValues, PromptTemplate } from "../types";
import { SimulatorNav } from "./SimulatorNav";

const EMPTY_FORM: PromptFormValues = { name: "", content: "" };

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SimulatorPromptsTab() {
  const colors = useThemeColors();
  const library = usePromptLibrary();
  const [form, setForm] = useState<PromptFormValues>(EMPTY_FORM);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isExisting = library.prompts.some((prompt) => prompt.name === form.name.trim());

  function handleEdit(prompt: PromptTemplate) {
    setForm({ name: prompt.name, content: prompt.content });
    setFieldError(null);
    setActionError(null);
    setSuccess(null);
  }

  async function handleSave() {
    let values: PromptFormValues;
    try {
      values = checkPromptValues(form);
    } catch (err) {
      setFieldError(messageOf(err, "Check the prompt."));
      return;
    }
    setFieldError(null);
    setActionError(null);
    setSuccess(null);
    setSaving(true);
    try {
      setSuccess(await library.save(values));
    } catch (err) {
      setActionError(messageOf(err, "Failed to save prompt."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section>
      <SimulatorNav current="prompts" />

      <Panel>
        <SectionTitle
          icon={isExisting ? Pencil : Plus}
          title={isExisting ? `Editing "${form.name.trim()}"` : "New prompt"}
        />
        <TextField
          label="Name"
          placeholder="e.g. captain_crush"
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          editable={!saving}
          maxLength={200}
        />
        <TextField
          label="Content"
          placeholder="The system prompt text…"
          value={form.content}
          onChangeText={(content) => setForm((current) => ({ ...current, content }))}
          editable={!saving}
          maxLength={10000}
          multiline
          voice
        />
        <ErrorText message={fieldError} />
        <ErrorText message={actionError} />
        {success ? <Text style={[styles.success, { color: colors.tone.emerald.fg }]}>{success}</Text> : null}
        <ActionButton
          label={saving ? "Saving…" : isExisting ? "Update prompt" : "Create prompt"}
          icon={Save}
          loading={saving || !library.loaded}
          onPress={handleSave}
        />
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpenCheck} title="Saved templates" />
        {library.loadError ? <ErrorText message={library.loadError} /> : null}
        {!library.loaded ? (
          <Text style={[styles.note, { color: colors.mutedForeground }]}>Loading prompts…</Text>
        ) : (
          library.prompts.map((prompt) => (
            <View key={prompt.name} style={[styles.row, { borderTopColor: colors.border }]}>
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                  {prompt.name}
                </Text>
                {prompt.builtIn ? (
                  <Text style={[styles.note, { color: colors.mutedForeground }]}>Built-in</Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => handleEdit(prompt)}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${prompt.name}`}
                style={({ pressed }) => [
                  styles.edit,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  pressed && { backgroundColor: colors.muted },
                ]}
              >
                <Pencil size={14} color={colors.foreground} />
                <Text style={[styles.editText, { color: colors.foreground }]}>Edit</Text>
              </Pressable>
            </View>
          ))
        )}
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  success: {
    fontSize: 14,
  },
  note: {
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 15,
    fontFamily: "monospace",
  },
  edit: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
