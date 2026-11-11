/**
 * Manage language profiles. Each profile is a native and target language pair. The active profile
 * is used by every Language Learner sub-app, so the user sets languages once here.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Plus, Trash2, X, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField, pointerCursor } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { LANGUAGE_OPTIONS } from "@/features/joke-coach/options";
import { createProfileId, validateProfile } from "../lib/profiles";
import { SAVE_FAILED_MESSAGE } from "../lib/profiles-storage";
import { useLanguageProfiles } from "../providers/LanguageProfilesProvider";
import type { LanguageProfile } from "../types";
import { ProfileRow } from "./ProfileRow";

type ProfileDraft = Omit<LanguageProfile, "id"> & { id: string | null };

const EMPTY_DRAFT: ProfileDraft = { id: null, name: "", nativeLanguage: "", targetLanguage: "" };

export function LanguageProfilesScreen() {
  const colors = useThemeColors();
  const { profiles, activeProfile, saveError, upsertProfile, removeProfile, activateProfile } = useLanguageProfiles();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<LanguageProfile | null>(null);
  const pendingRef = useRef<LanguageProfile | null>(null);
  const removeRef = useRef(removeProfile);
  removeRef.current = removeProfile;

  const visibleProfiles = pending ? profiles.filter((profile) => profile.id !== pending.id) : profiles;

  const commitPending = useCallback(async () => {
    const target = pendingRef.current;
    if (!target) return;
    pendingRef.current = null;
    setPending(null);
    try {
      await removeRef.current(target.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the profile. Please try again.");
    }
  }, []);

  useEffect(() => {
    return () => {
      void commitPending();
    };
  }, [commitPending]);

  function update<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setError(null);
  }

  function startEdit(profile: LanguageProfile) {
    setDraft({ ...profile });
    setError(null);
  }

  function startAdd() {
    setDraft({ ...EMPTY_DRAFT });
    setError(null);
  }

  function closeEditor() {
    setDraft(null);
    setError(null);
  }

  async function run(action: () => Promise<void>, failure: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : failure);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    const problem = validateProfile(draft);
    if (problem) {
      setError(problem);
      return;
    }
    const profile: LanguageProfile = {
      id: draft.id ?? createProfileId(),
      name: draft.name.trim(),
      nativeLanguage: draft.nativeLanguage.trim(),
      targetLanguage: draft.targetLanguage.trim(),
    };
    await run(async () => {
      await upsertProfile(profile);
      setDraft(null);
    }, "Could not save the profile. Please try again.");
  }

  function handleDelete(profile: LanguageProfile) {
    if (visibleProfiles.length <= 1) {
      setError("Keep at least one language profile.");
      return;
    }
    void commitPending();
    pendingRef.current = profile;
    setPending(profile);
    setDraft(null);
    setError(null);
  }

  function deleteDraft() {
    const stored = profiles.find((profile) => profile.id === draft?.id);
    if (stored) handleDelete(stored);
  }

  function undoDelete() {
    pendingRef.current = null;
    setPending(null);
  }

  const editing = draft !== null;
  const title = draft ? (draft.id ? "Edit profile" : "New profile") : "Language profiles";

  const headerRight = draft ? (
    <>
      {draft.id ? (
        <HeaderIcon
          icon={Trash2}
          label={`Delete profile ${draft.name}`}
          color={colors.destructive}
          disabled={busy}
          onPress={deleteDraft}
        />
      ) : null}
      <HeaderIcon icon={X} label="Close profile editor" disabled={busy} onPress={closeEditor} />
    </>
  ) : (
    <HeaderIcon icon={Plus} label="Add profile" disabled={busy} onPress={startAdd} />
  );

  const footer = draft ? (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton label={busy ? "Saving…" : "Save profile"} loading={busy} onPress={handleSave} />
    </View>
  ) : undefined;

  return (
    <ToolScreen title={title} wide={!editing} usesAi={false} headerRight={headerRight} footer={footer}>
      {draft ? (
        <>
          <TextField
            label="Profile name"
            placeholder="e.g. English to French"
            value={draft.name}
            onChangeText={(text) => update("name", text)}
            editable={!busy}
            maxLength={100}
          />
          <SelectField
            label="Native language"
            options={LANGUAGE_OPTIONS}
            value={draft.nativeLanguage}
            onChange={(value) => update("nativeLanguage", value)}
            customPlaceholder="e.g. Swahili"
          />
          <SelectField
            label="Target language"
            options={LANGUAGE_OPTIONS}
            value={draft.targetLanguage}
            onChange={(value) => update("targetLanguage", value)}
            customPlaceholder="e.g. Swahili"
          />
        </>
      ) : (
        <>
          <ErrorText message={error} />
          <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {visibleProfiles.map((profile, index) => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                active={profile.id === activeProfile.id}
                disabled={busy}
                divider={index > 0}
                onActivate={() => void run(() => activateProfile(profile.id), "Could not switch profile.")}
                onEdit={() => startEdit(profile)}
              />
            ))}
          </View>
        </>
      )}

      {pending ? (
        <UndoSnackbar
          message={`Deleted profile ${pending.name}`}
          onUndo={undoDelete}
          onDismiss={commitPending}
        />
      ) : null}
    </ToolScreen>
  );
}

function HeaderIcon({
  icon: Icon,
  label,
  onPress,
  disabled = false,
  color,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.headerIcon,
        pointerCursor,
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={22} color={color ?? colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  list: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  headerIcon: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
});
