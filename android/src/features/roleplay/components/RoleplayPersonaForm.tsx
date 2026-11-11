// src/features/roleplay/components/RoleplayPersonaForm.tsx
/**
 * Persona page body: saved personas to reuse, the AI writer, and the persona fields. Every change
 * saves to the device as it is typed.
 */
import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BookOpenCheck, Drama, UserCog } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, Panel, TextField, pointerCursor } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRoleplayRoles } from "../hooks/useRoleplayRoles";
import { useSystemPromptAssistant } from "../hooks/useSystemPromptAssistant";
import type { PersonaState } from "../hooks/usePersona";
import { ADDITIONAL_INSTRUCTIONS_MAX, SEED_MAX, SYSTEM_PROMPT_MAX } from "../options";
import { SystemPromptAssistant } from "./SystemPromptAssistant";

export function RoleplayPersonaFields({ persona }: { persona: PersonaState }) {
  const colors = useThemeColors();
  const router = useRouter();
  const savedRoles = useRoleplayRoles();
  const { reload } = savedRoles;
  const { settings, updateSettings } = persona;
  const onGenerated = useCallback((prompt: string) => updateSettings({ systemPrompt: prompt }), [updateSettings]);
  const assistant = useSystemPromptAssistant(onGenerated);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (!persona.loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading persona…</Text>
      </View>
    );
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={BookOpenCheck} title="Saved personas" />
        {savedRoles.roles.length > 0 && (
          <View style={styles.chips}>
            {savedRoles.roles.map((role) => {
              const selected = role.prompt === settings.systemPrompt;
              return (
                <Pressable
                  key={role.name}
                  onPress={() => updateSettings({ systemPrompt: role.prompt })}
                  accessibilityRole="button"
                  accessibilityLabel={role.name}
                  accessibilityState={{ selected }}
                  style={[
                    styles.chip,
                    pointerCursor,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : colors.card,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.primaryForeground : colors.foreground }]}>
                    {role.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <ActionButton
          label="Manage saved personas"
          icon={UserCog}
          variant="outline"
          onPress={() => router.push("/language-learner/roleplay/roles")}
        />
      </Panel>

      <SystemPromptAssistant assistant={assistant} />

      <Panel>
        <SectionTitle icon={Drama} title="Persona" />
        <TextField
          label="System prompt"
          placeholder="e.g. You are a grumpy Parisian waiter."
          value={settings.systemPrompt}
          onChangeText={(text) => updateSettings({ systemPrompt: text })}
          maxLength={SYSTEM_PROMPT_MAX}
          multiline
          voice
        />
        <TextField
          label="User instructions (optional)"
          placeholder="e.g. Be sarcastic but helpful."
          value={settings.additionalInstructions}
          onChangeText={(text) => updateSettings({ additionalInstructions: text })}
          maxLength={ADDITIONAL_INSTRUCTIONS_MAX}
          multiline
          voice
        />
        <TextField
          label="Session seed (optional)"
          placeholder="Leave blank to auto-generate"
          value={settings.seed}
          onChangeText={(text) => updateSettings({ seed: text })}
          maxLength={SEED_MAX}
        />
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing["2xl"],
  },
  loadingText: {
    ...typeScale.body,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    minHeight: touchTarget,
    justifyContent: "center",
  },
  chipText: {
    ...typeScale.label,
  },
});
