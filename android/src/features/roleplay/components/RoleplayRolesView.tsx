// src/features/roleplay/components/RoleplayRolesView.tsx
/**
 * Saved personas. Tapping a row starts a chat with that persona. The edit form sits below the list in
 * a disclosure, and opens when a row's edit button is tapped. Saving a name that already exists
 * updates that persona's prompt.
 */
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Pencil, Plus, RefreshCcw, Save, Trash2, UserCog, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField, pointerCursor } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { useRoleplayRoles } from "../hooks/useRoleplayRoles";
import { useSystemPromptAssistant } from "../hooks/useSystemPromptAssistant";
import { ROLE_NAME_MAX, ROLE_PROMPT_MAX } from "../options";
import { loadSettings, saveSettings } from "../lib/persistence";
import { scenarioOf } from "../lib/text";
import type { RoleRecord } from "../types";
import { SystemPromptAssistant } from "./SystemPromptAssistant";

export function RoleplayRolesView() {
  const colors = useThemeColors();
  const router = useRouter();
  const roles = useRoleplayRoles();
  const { reload, setForm, undoRemoval, commitRemoval } = roles;
  const assistant = useSystemPromptAssistant((prompt) => setForm((current) => ({ ...current, prompt })));
  const [formOpen, setFormOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  async function startChat(role: RoleRecord) {
    setStartError(null);
    try {
      const current = await loadSettings();
      await saveSettings({ ...current, systemPrompt: role.prompt });
      router.navigate("/language-learner/roleplay");
    } catch {
      setStartError("Couldn't open this persona. Try again.");
    }
  }

  function editRole(role: RoleRecord) {
    roles.edit(role);
    setFormOpen(true);
  }

  function newRole() {
    roles.startNew();
    setFormOpen(true);
  }

  return (
    <Section>
      <ErrorText message={startError} />

      {roles.loadError ? (
        <>
          <ErrorText message={roles.loadError} />
          <ActionButton label="Retry loading" icon={RefreshCcw} variant="outline" onPress={() => void reload()} />
        </>
      ) : !roles.loaded ? (
        <ActivityIndicator color={colors.primary} />
      ) : roles.roles.length === 0 ? (
        <>
          <EmptyHint icon={UserCog} title="No saved personas" hint="Save a persona here to reuse it in a chat." />
          <ActionButton label="New persona" icon={Plus} onPress={newRole} />
        </>
      ) : (
        <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {roles.roles.map((role, index) => (
            <RoleRow
              key={role.name}
              role={role}
              divider={index > 0}
              onStart={() => void startChat(role)}
              onEdit={() => editRole(role)}
              onDelete={() => roles.remove(role.name)}
            />
          ))}
        </View>
      )}

      {roles.removed !== null ? (
        <UndoSnackbar
          message={`Deleted role ${roles.removed}`}
          onUndo={undoRemoval}
          onDismiss={commitRemoval}
        />
      ) : null}

      <Disclosure
        title={roles.editing ? `Editing "${roles.form.name}"` : "New persona"}
        icon={roles.editing ? Pencil : Plus}
        open={formOpen}
        onToggle={setFormOpen}
      >
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
          placeholder="e.g. You are a grumpy Parisian waiter."
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
        {roles.editing && <ActionButton label="New persona" icon={Plus} variant="outline" onPress={newRole} />}
      </Disclosure>
    </Section>
  );
}

function RoleRow({
  role,
  divider,
  onStart,
  onEdit,
  onDelete,
}: {
  role: RoleRecord;
  divider: boolean;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={`Start chat with ${role.name}`}
        style={({ pressed }) => [styles.rowMain, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.rowText}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>
            {role.name}
          </Text>
          <Text numberOfLines={1} style={[styles.scenario, { color: colors.mutedForeground }]}>
            {scenarioOf(role.prompt)}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.mutedForeground} />
      </Pressable>
      <RowIconButton icon={Pencil} label={`Edit ${role.name}`} color={colors.foreground} onPress={onEdit} />
      <RowIconButton icon={Trash2} label={`Delete ${role.name}`} color={colors.destructive} onPress={onDelete} />
    </View>
  );
}

function RowIconButton({
  icon: Icon,
  label,
  color,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  success: {
    ...typeScale.caption,
  },
  list: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  rowMain: {
    flex: 1,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typeScale.label,
    fontWeight: "600",
  },
  scenario: {
    ...typeScale.caption,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
