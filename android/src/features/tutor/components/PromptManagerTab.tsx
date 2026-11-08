// src/features/tutor/components/PromptManagerTab.tsx
/** Prompt template manager: create, edit, and delete the persona prompts the tutor can load. */
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { BookOpenCheck, Pencil, Plus, Save, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { usePromptTemplates } from "../hooks/usePromptTemplates";
import type { PromptTemplate } from "../types";
import { messageOf } from "../lib/values";
import { PROMPT_CONTENT_MAX, PROMPT_NAME_MAX } from "../lib/prompt-templates";

const SOURCE_LABELS: Record<PromptTemplate["source"], string> = {
  "built-in": "Built-in",
  customized: "Customised built-in",
  custom: "Custom",
};

export function PromptManagerTab() {
  const colors = useThemeColors();
  const templates = usePromptTemplates();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function clearForm() {
    setName("");
    setContent("");
    setEditing(null);
    setError(null);
    setSuccess(null);
  }

  function edit(template: PromptTemplate) {
    setName(template.name);
    setContent(template.content);
    setEditing(template.name);
    setError(null);
    setSuccess(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const saved = await templates.save({ name, content });
      setName(saved);
      setEditing(saved);
      setSuccess(`Prompt '${saved}' saved.`);
    } catch (err) {
      setError(messageOf(err, "Could not save the prompt."));
    } finally {
      setBusy(false);
    }
  }

  function confirmRemove(template: PromptTemplate) {
    const restoring = template.source === "customized";
    Alert.alert(
      restoring ? "Restore built-in?" : "Delete template?",
      restoring
        ? `Replace your changes to "${template.name}" with the built-in version?`
        : `Delete "${template.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: restoring ? "Restore" : "Delete",
          style: "destructive",
          onPress: () => void remove(template),
        },
      ],
    );
  }

  async function remove(template: PromptTemplate) {
    setError(null);
    setSuccess(null);
    try {
      await templates.remove(template.name);
      if (editing === template.name) clearForm();
      setSuccess(`Removed '${template.name}'.`);
    } catch (err) {
      setError(messageOf(err, "Could not remove the prompt."));
    }
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={editing ? Pencil : Plus} title={editing ? `Editing "${editing}"` : "New template"} />
        <TextField
          label="Name"
          placeholder="e.g. socratic_tutor"
          hint="Letters, numbers, dashes, dots, and underscores only."
          value={name}
          onChangeText={setName}
          editable={!busy}
          maxLength={PROMPT_NAME_MAX}
        />
        <TextField
          label="Content"
          placeholder="The system prompt text…"
          value={content}
          onChangeText={setContent}
          editable={!busy}
          maxLength={PROMPT_CONTENT_MAX}
          multiline
        />
        <ErrorText message={error} />
        {success ? <Text style={[styles.success, { color: colors.tone.emerald.fg }]}>{success}</Text> : null}
        <ActionButton
          label={busy ? "Saving…" : editing ? "Update template" : "Create template"}
          icon={Save}
          loading={busy}
          onPress={() => void save()}
        />
        <ActionButton label="New template" icon={Plus} variant="outline" onPress={clearForm} />
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpenCheck} title="Saved templates" />
        <ErrorText message={templates.error} />
        {!templates.loaded ? (
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading templates…</Text>
        ) : templates.templates.length === 0 ? (
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>No prompt templates yet.</Text>
        ) : (
          templates.templates.map((template) => (
            <View key={template.name} style={[styles.row, { borderColor: colors.border }]}>
              <View style={styles.rowHeader}>
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                  {template.name}
                </Text>
                <Text style={[styles.badge, { color: colors.mutedForeground }]}>{SOURCE_LABELS[template.source]}</Text>
              </View>
              <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
                {template.content}
              </Text>
              <View style={styles.actions}>
                <View style={styles.action}>
                  <ActionButton label="Edit" icon={Pencil} variant="outline" onPress={() => edit(template)} />
                </View>
                {template.source !== "built-in" ? (
                  <View style={styles.action}>
                    <ActionButton
                      label={template.source === "customized" ? "Restore" : "Delete"}
                      icon={Trash2}
                      variant="outline"
                      onPress={() => confirmRemove(template)}
                    />
                  </View>
                ) : null}
              </View>
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
    lineHeight: 20,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  badge: {
    fontSize: 12,
  },
  preview: {
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
