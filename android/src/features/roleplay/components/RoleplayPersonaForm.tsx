// src/features/roleplay/components/RoleplayPersonaForm.tsx
/**
 * Persona page body: saved personas to reuse, the AI writer, and the persona fields. Every change
 * saves to the device as it is typed.
 */
import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BookOpenCheck, Drama, Sparkles, UserCog } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel, TextField } from "@/components/tool/FormControls";
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
      {savedRoles.roles.length > 0 && (
        <Panel>
          <SectionTitle icon={BookOpenCheck} title="Saved personas" />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Tap a saved persona to use its prompt.</Text>
          <View style={styles.chips}>
            {savedRoles.roles.map((role) => {
              const selected = role.prompt === settings.systemPrompt;
              return (
                <Pressable
                  key={role.name}
                  onPress={() => updateSettings({ systemPrompt: role.prompt })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.chip,
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
        </Panel>
      )}

      <Panel>
        <SectionTitle icon={Sparkles} title="Write with AI" />
        <SystemPromptAssistant assistant={assistant} />
      </Panel>

      <Panel>
        <SectionTitle icon={Drama} title="Persona" />
        <TextField
          label="System prompt"
          placeholder="e.g. You are a grumpy Parisian waiter."
          hint="The persona the chatbot will embody."
          value={settings.systemPrompt}
          onChangeText={(text) => updateSettings({ systemPrompt: text })}
          maxLength={SYSTEM_PROMPT_MAX}
          multiline
          voice
        />
        <TextField
          label="User instructions (optional)"
          placeholder="e.g. Be sarcastic but helpful."
          hint="Constraints for each turn."
          value={settings.additionalInstructions}
          onChangeText={(text) => updateSettings({ additionalInstructions: text })}
          maxLength={ADDITIONAL_INSTRUCTIONS_MAX}
          multiline
          voice
        />
        <TextField
          label="Session seed (optional)"
          placeholder="Leave blank to auto-generate"
          hint="Keeps the character consistent across turns."
          value={settings.seed}
          onChangeText={(text) => updateSettings({ seed: text })}
          maxLength={SEED_MAX}
        />
        <ActionButton
          label="Manage saved personas"
          icon={UserCog}
          variant="outline"
          onPress={() => router.push("/language-learner/roleplay/roles")}
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
    fontSize: 14,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
