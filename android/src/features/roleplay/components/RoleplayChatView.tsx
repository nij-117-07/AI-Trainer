// src/features/roleplay/components/RoleplayChatView.tsx
/**
 * Roleplay chat body: the persona settings, saved roles to reuse, the transcript, and the
 * composer. Settings and the conversation are kept on the device between visits.
 */
import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Drama, Eraser, Loader2, MessagesSquare, UserCog } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRoleplayChat } from "../hooks/useRoleplayChat";
import { useRoleplayRoles } from "../hooks/useRoleplayRoles";
import {
  ADDITIONAL_INSTRUCTIONS_MAX,
  LANGUAGE_MAX,
  SEED_MAX,
  SYSTEM_PROMPT_MAX,
} from "../options";
import { MessageBubble } from "./MessageBubble";
import { RoleplayComposer } from "./RoleplayComposer";

export function RoleplayChatView() {
  const colors = useThemeColors();
  const router = useRouter();
  const chat = useRoleplayChat();
  const savedRoles = useRoleplayRoles();
  const { reload } = savedRoles;
  const { settings, pending, updateSettings } = chat;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (!chat.loaded) {
    return (
      <View style={styles.loading}>
        {chat.error ? (
          <ErrorText message={chat.error} />
        ) : (
          <>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading conversation…</Text>
          </>
        )}
      </View>
    );
  }

  const speaker = "Persona";

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Drama} title="Persona" />
        {savedRoles.roles.length > 0 && (
          <Field label="Saved roles" hint="Tap a role to use its prompt as the persona.">
            <View style={styles.chips}>
              {savedRoles.roles.map((role) => {
                const selected = role.prompt === settings.systemPrompt;
                return (
                  <Pressable
                    key={role.name}
                    onPress={() => updateSettings({ systemPrompt: role.prompt })}
                    disabled={pending}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: pending }}
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
          </Field>
        )}
        <TextField
          label="System prompt"
          placeholder="e.g. You are a grumpy Parisian waiter."
          hint="The persona the chatbot will embody."
          value={settings.systemPrompt}
          onChangeText={(text) => updateSettings({ systemPrompt: text })}
          editable={!pending}
          maxLength={SYSTEM_PROMPT_MAX}
          multiline
        />
        <TextField
          label="Language"
          placeholder="e.g. French"
          hint="The language the chatbot must communicate in."
          value={settings.language}
          onChangeText={(text) => updateSettings({ language: text })}
          editable={!pending}
          maxLength={LANGUAGE_MAX}
        />
        <TextField
          label="Additional instructions"
          placeholder="e.g. Be sarcastic but helpful."
          hint="Constraints for each turn."
          value={settings.additionalInstructions}
          onChangeText={(text) => updateSettings({ additionalInstructions: text })}
          editable={!pending}
          maxLength={ADDITIONAL_INSTRUCTIONS_MAX}
          multiline
        />
        <TextField
          label="Session seed"
          placeholder="Leave blank to auto-generate"
          hint="Keeps the character consistent across turns."
          value={settings.seed}
          onChangeText={(text) => updateSettings({ seed: text })}
          editable={!pending}
          maxLength={SEED_MAX}
        />
        <ActionButton label="Manage roles" icon={UserCog} variant="outline" onPress={() => router.push("/language-learner/roleplay/roles")} />
      </Panel>

      <Panel>
        <SectionTitle icon={MessagesSquare} title="Conversation" />
        {chat.history.length === 0 && !pending ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Describe a persona, then send your first message to step into character.
          </Text>
        ) : (
          chat.history.map((message, index) => <MessageBubble key={index} message={message} speaker={speaker} />)
        )}
        {pending && (
          <View style={styles.typingRow}>
            <Loader2 size={14} color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.mutedForeground }]}>The persona is responding…</Text>
          </View>
        )}
      </Panel>

      <ErrorText message={chat.error} />

      <Panel>
        <RoleplayComposer
          value={chat.draft}
          onChangeText={chat.setDraft}
          onSend={chat.send}
          pending={pending}
        />
      </Panel>

      <ActionButton
        label="New roleplay"
        icon={Eraser}
        variant="outline"
        onPress={chat.newConversation}
      />
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
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  typingText: {
    fontSize: 13,
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
