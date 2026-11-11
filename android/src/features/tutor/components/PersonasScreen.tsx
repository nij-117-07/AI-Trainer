// src/features/tutor/components/PersonasScreen.tsx
/**
 * Saved teaching styles (prompt templates). Tap a row to edit it, and the form for a new or edited
 * template is pinned to the footer.
 */
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshCcw, Save, Trash2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField, pointerCursor } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { usePromptTemplates } from "../hooks/usePromptTemplates";
import type { PromptTemplate } from "../types";
import { messageOf } from "../lib/values";
import { PROMPT_CONTENT_MAX, PROMPT_NAME_MAX } from "../lib/prompt-templates";

const SOURCE_LABELS: Record<PromptTemplate["source"], string> = {
  "built-in": "Built-in",
  customized: "Customised built-in",
  custom: "Custom",
};

export function PersonasScreen() {
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
      setSuccess(`Saved '${saved}'.`);
    } catch (err) {
      setError(messageOf(err, "Couldn't save the template."));
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
      setError(messageOf(err, "Couldn't remove the template."));
    }
  }

  return (
    <ToolScreen
      title="Teaching styles"
      usesAi={false}
      headerRight={<ResetButton onPress={clearForm} accessibilityLabel="Reset template form" />}
      footer={
        <View style={styles.footer}>
          {editing ? <Text style={[styles.editing, { color: colors.mutedForeground }]}>Editing "{editing}"</Text> : null}
          <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
            <TextField
              label="Name"
              placeholder="e.g. patient_coach"
              hint="Letters, numbers, dashes, dots, and underscores only."
              value={name}
              onChangeText={setName}
              editable={!busy}
              maxLength={PROMPT_NAME_MAX}
            />
            <TextField
              label="Prompt"
              placeholder="e.g. Explain with one short example, then ask one question."
              value={content}
              onChangeText={setContent}
              editable={!busy}
              maxLength={PROMPT_CONTENT_MAX}
              multiline
              voice
            />
          </ScrollView>
          <ErrorText message={error} />
          {success ? (
            <Text accessibilityLiveRegion="polite" style={[styles.success, { color: colors.tone.emerald.fg }]}>
              {success}
            </Text>
          ) : null}
          <ActionButton label={busy ? "Saving…" : "Save template"} icon={Save} loading={busy} onPress={() => void save()} />
        </View>
      }
    >
      <Section>
        <ErrorText message={templates.error} />
        {!templates.loaded ? (
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading templates…</Text>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {templates.templates.map((template, index) => {
              const removable = template.source !== "built-in";
              const restoring = template.source === "customized";
              return (
                <View
                  key={template.name}
                  style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <Pressable
                    onPress={() => edit(template)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${template.name}`}
                    accessibilityState={{ selected: editing === template.name }}
                    style={({ pressed }) => [
                      styles.rowMain,
                      pointerCursor,
                      (pressed || editing === template.name) && { backgroundColor: colors.muted },
                    ]}
                  >
                    <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                      {template.name}
                    </Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>{SOURCE_LABELS[template.source]}</Text>
                  </Pressable>
                  {removable ? (
                    <Pressable
                      onPress={() => confirmRemove(template)}
                      accessibilityRole="button"
                      accessibilityLabel={`${restoring ? "Restore" : "Delete"} ${template.name}`}
                      style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
                    >
                      {restoring ? (
                        <RefreshCcw size={20} color={colors.foreground} />
                      ) : (
                        <Trash2 size={20} color={colors.foreground} />
                      )}
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  editing: {
    ...typeScale.label,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  success: {
    ...typeScale.label,
    fontWeight: "400",
  },
  muted: {
    ...typeScale.body,
  },
  list: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
  },
  rowMain: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    ...typeScale.body,
    fontWeight: "600",
  },
  meta: {
    ...typeScale.label,
    fontWeight: "400",
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    marginRight: spacing.xs,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
