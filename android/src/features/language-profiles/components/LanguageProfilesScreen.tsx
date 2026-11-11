// src/features/language-profiles/components/LanguageProfilesScreen.tsx
/**
 * Manage language profiles. Each profile is a native and target language pair. The active profile
 * is used by every Language Learner sub-app, so the user sets languages once here.
 */
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Pencil, Plus, Trash2 } from "lucide-react-native";
import { contentWidth, radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { createProfileId, describePair, validateProfile } from "../lib/profiles";
import { useLanguageProfiles } from "../providers/LanguageProfilesProvider";
import type { LanguageProfile } from "../types";

type ProfileDraft = Omit<LanguageProfile, "id"> & { id: string | null };

const EMPTY_DRAFT: ProfileDraft = { id: null, name: "", nativeLanguage: "", targetLanguage: "" };

export function LanguageProfilesScreen() {
  const colors = useThemeColors();
  const { profiles, activeProfile, upsertProfile, removeProfile, activateProfile } = useLanguageProfiles();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setError(null);
  }

  function startEdit(profile: LanguageProfile) {
    setDraft({ ...profile });
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
    if (profiles.length <= 1) {
      setError("Keep at least one language profile.");
      return;
    }
    Alert.alert("Delete profile", `Delete "${profile.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void run(async () => {
            await removeProfile(profile.id);
            if (draft?.id === profile.id) setDraft(null);
          }, "Could not delete the profile. Please try again.");
        },
      },
    ]);
  }

  return (
    <ToolScreen title="Language Profiles" wide>
      <Section>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Set your native and target languages once. Every Language Learner sub-app uses the active profile.
        </Text>

        <ErrorText message={error} />

        {draft ? (
          <View style={styles.form}>
            <Panel>
              <SectionTitle icon={draft.id ? Pencil : Plus} title={draft.id ? "Edit profile" : "New profile"} />
              <TextField
                label="Profile name"
                placeholder="e.g. English to French"
                value={draft.name}
                onChangeText={(text) => update("name", text)}
                editable={!busy}
                maxLength={100}
              />
              <TextField
                label="Native language"
                placeholder="e.g. English"
                hint="The language you explain things in."
                value={draft.nativeLanguage}
                onChangeText={(text) => update("nativeLanguage", text)}
                editable={!busy}
                maxLength={100}
              />
              <TextField
                label="Target language"
                placeholder="e.g. French"
                hint="The language you are learning."
                value={draft.targetLanguage}
                onChangeText={(text) => update("targetLanguage", text)}
                editable={!busy}
                maxLength={100}
              />
              <ActionButton label={busy ? "Saving…" : "Save profile"} loading={busy} onPress={handleSave} />
              <ActionButton label="Cancel" variant="outline" onPress={closeEditor} disabled={busy} />
            </Panel>
          </View>
        ) : (
          <ActionButton
            label="Add profile"
            icon={Plus}
            variant="outline"
            onPress={() => {
              setDraft({ ...EMPTY_DRAFT });
              setError(null);
            }}
            disabled={busy}
          />
        )}

        <CardGrid>
          {profiles.map((profile) => {
            const active = profile.id === activeProfile.id;
            return (
              <View
                key={profile.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Pressable
                  onPress={() => void run(() => activateProfile(profile.id), "Could not switch profile.")}
                  disabled={busy || active}
                  accessibilityRole="radio"
                  accessibilityLabel={`Use ${profile.name}`}
                  accessibilityState={{ selected: active, disabled: busy }}
                  style={({ pressed }) => [styles.cardMain, pressed && { opacity: 0.85 }]}
                >
                  <View
                    style={[
                      styles.radio,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.background },
                    ]}
                  >
                    {active ? <Check size={14} color={colors.primaryForeground} /> : null}
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>{profile.name}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{describePair(profile)}</Text>
                    {active ? <Text style={[styles.activeTag, { color: colors.primary }]}>Active</Text> : null}
                  </View>
                </Pressable>
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => startEdit(profile)}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${profile.name}`}
                    style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
                  >
                    <Pencil size={18} color={colors.foreground} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(profile)}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${profile.name}`}
                    style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
                  >
                    <Trash2 size={18} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </CardGrid>
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    width: "100%",
    maxWidth: contentWidth.form,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardMain: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 13,
  },
  activeTag: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
