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
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRoleplayRoles } from "../hooks/useRoleplayRoles";
import { ROLE_NAME_MAX, ROLE_PROMPT_MAX } from "../options";
import type { RoleRecord } from "../types";

export function RoleplayRolesView() {
  const colors = useThemeColors();
  const roles = useRoleplayRoles();
  const { reload } = roles;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function confirmDelete(role: RoleRecord) {
    Alert.alert("Delete this persona?", `Delete roleplay persona "${role.name}"?`, [
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
        {roles.success ? <Text style={[styles.success, { color: colors.tone.emerald.fg }]}>{roles.success}</Text> : null}
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
            <ActionButton label="Retry" icon={RefreshCcw} variant="outline" onPress={() => void reload()} />
          </>
        ) : roles.roles.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            {roles.loaded ? "No personas saved yet. Create one above." : "Loading personas…"}
          </Text>
        ) : (
          roles.roles.map((role) => (
            <View key={role.name} style={[styles.row, { borderTopColor: colors.border }]}>
              <View style={styles.nameWrap}>
                <UserCog size={16} color={colors.mutedForeground} />
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                  {role.name}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => roles.edit(role)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${role.name}`}
                  style={[styles.smallButton, { borderColor: colors.border }]}
                >
                  <Pencil size={14} color={colors.foreground} />
                  <Text style={[styles.smallText, { color: colors.foreground }]}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmDelete(role)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${role.name}`}
                  style={[styles.smallButton, { borderColor: colors.destructive }]}
                >
                  <Trash2 size={14} color={colors.destructive} />
                  <Text style={[styles.smallText, { color: colors.destructive }]}>Delete</Text>
                </Pressable>
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
    fontSize: 13,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  nameWrap: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  smallText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
