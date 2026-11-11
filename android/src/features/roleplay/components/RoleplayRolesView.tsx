// src/features/roleplay/components/RoleplayRolesView.tsx
/**
 * Role manager for the roleplay chat. Lists the saved personas and lets you create, edit, or
 * delete them. Saving a name that already exists updates that persona's prompt.
 */
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { BookOpenCheck, Pencil, Plus, RefreshCcw, Save, Trash2, UserCog } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField, pointerCursor } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRoleplayRoles } from "../hooks/useRoleplayRoles";
import { useSystemPromptAssistant } from "../hooks/useSystemPromptAssistant";
import { ROLE_NAME_MAX, ROLE_PROMPT_MAX } from "../options";
import type { RoleRecord } from "../types";
import { SystemPromptAssistant } from "./SystemPromptAssistant";

export function RoleplayRolesView() {
  const colors = useThemeColors();
  const roles = useRoleplayRoles();
  const { reload, setForm } = roles;
  const assistant = useSystemPromptAssistant((prompt) => setForm((current) => ({ ...current, prompt })));

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function confirmDelete(role: RoleRecord) {
    Alert.alert("Delete this persona?", `"${role.name}" will be removed. This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void roles.remove(role.name) },
    ]);
  }

  return (
    <Section>
      <Panel>
        <SectionTitle
          icon={roles.editing ? Pencil : Plus}
          title={roles.editing ? `Editing "${roles.form.name}"` : "New persona"}
        />
        <TextField
          label="Name"
          placeholder="e.g. grumpy_waiter"
          value={roles.form.name}
          onChangeText={(name) => roles.setForm((current) => ({ ...current, name }))}
          maxLength={ROLE_NAME_MAX}
        />
        <SystemPromptAssistant assistant={assistant} />
        <TextField
          label="Prompt"
          placeholder="The persona system prompt, e.g. 'You are a grumpy Parisian waiter.'"
          value={roles.form.prompt}
          onChangeText={(prompt) => roles.setForm((current) => ({ ...current, prompt }))}
          maxLength={ROLE_PROMPT_MAX}
          multiline
          voice
        />
        <ErrorText message={roles.actionError} />
        <View accessibilityLiveRegion="polite">
          {roles.success ? <Text style={[styles.success, { color: colors.tone.emerald.fg }]}>{roles.success}</Text> : null}
        </View>
        <ActionButton
          label={roles.editing ? "Update persona" : "Create persona"}
          icon={Save}
          onPress={() => void roles.save()}
        />
        {roles.editing && <ActionButton label="New persona" icon={Plus} variant="outline" onPress={roles.startNew} />}
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpenCheck} title="Saved personas" />
        {roles.loadError ? (
          <>
            <ErrorText message={roles.loadError} />
            <ActionButton label="Retry loading" icon={RefreshCcw} variant="outline" onPress={() => void reload()} />
          </>
        ) : roles.roles.length === 0 ? (
          <Text accessibilityLiveRegion="polite" style={[styles.empty, { color: colors.mutedForeground }]}>
            {roles.loaded ? "No personas saved yet. Use the form to create your first one." : "Loading personas…"}
          </Text>
        ) : (
          <CardGrid>
            {roles.roles.map((role) => (
              <RoleCard
                key={role.name}
                role={role}
                onEdit={() => roles.edit(role)}
                onDelete={() => confirmDelete(role)}
              />
            ))}
          </CardGrid>
        )}
      </Panel>
    </Section>
  );
}

function RoleCard({ role, onEdit, onDelete }: { role: RoleRecord; onEdit: () => void; onDelete: () => void }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.nameRow}>
        <UserCog size={16} color={colors.mutedForeground} />
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {role.name}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${role.name}`}
          style={({ pressed }) => [
            styles.smallButton,
            pointerCursor,
            { borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <Pencil size={14} color={colors.foreground} />
          <Text style={[styles.smallText, { color: colors.foreground }]}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${role.name}`}
          style={({ pressed }) => [
            styles.smallButton,
            pointerCursor,
            { borderColor: colors.destructive },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <Trash2 size={14} color={colors.destructive} />
          <Text style={[styles.smallText, { color: colors.destructive }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  success: {
    fontSize: 13,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "monospace",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  smallButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  smallText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
