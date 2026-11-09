// src/features/chatbot/components/ChatbotAdminScreen.tsx
/** Chatbot admin: create, edit, duplicate, and delete personas, and set chat-wide defaults. */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Copy, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isSpeechConfigured, resolveSpeechConnection } from "@/features/ai-settings/lib/speech";
import { removeChatsForPersona } from "../lib/chat-store";
import { confirmAction } from "../lib/confirm";
import { makeId } from "../lib/ids";
import { createPersona, duplicatePersona, updatePersona } from "../lib/persona-model";
import type { Persona, PersonaDraft } from "../types";
import { useChatbotConfig } from "../hooks/useChatbotConfig";
import { ChatbotSettingsCard } from "./ChatbotSettingsCard";
import { PersonaAvatar } from "./PersonaAvatar";
import { PersonaEditor } from "./PersonaEditor";

export function ChatbotAdminScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const config = useChatbotConfig();
  const { settings: aiSettings } = useAiSettings();
  const speechReady = isSpeechConfigured(resolveSpeechConnection(aiSettings));
  const [editing, setEditing] = useState<Persona | "new" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/tools");
  };

  async function attempt(action: () => Promise<void>, success: string) {
    setNotice(null);
    try {
      await action();
      setNotice(success);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "The change could not be saved.");
    }
  }

  async function savePersona(draft: PersonaDraft) {
    const now = new Date().toISOString();
    const existing = editing && editing !== "new" ? editing : null;
    const next = existing
      ? config.personas.map((p) => (p.id === existing.id ? updatePersona(p, draft, now) : p))
      : [...config.personas, createPersona(draft, makeId("persona"), now)];
    await config.savePersonaList(next);
    setEditing(null);
    setNotice(existing ? "Persona saved." : "Persona created.");
  }

  function duplicate(persona: Persona) {
    const now = new Date().toISOString();
    void attempt(
      () => config.savePersonaList([...config.personas, duplicatePersona(persona, makeId("persona"), now)]),
      `Copied ${persona.name}.`,
    );
  }

  function makeDefault(persona: Persona) {
    void attempt(
      () => config.saveSettingsValues({ ...config.settings, defaultPersonaId: persona.id }),
      `${persona.name} is now the default.`,
    );
  }

  function remove(persona: Persona) {
    if (config.personas.length <= 1) {
      setNotice("Keep at least one persona. Create another before deleting this one.");
      return;
    }
    confirmAction("Delete this persona?", `${persona.name} and its chats will be removed from this device.`, () => {
      void attempt(async () => {
        await removeChatsForPersona(persona.id);
        await config.savePersonaList(config.personas.filter((p) => p.id !== persona.id));
        if (config.settings.defaultPersonaId === persona.id) {
          await config.saveSettingsValues({ ...config.settings, defaultPersonaId: "" });
        }
      }, `Deleted ${persona.name}.`);
    });
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={editing ? () => setEditing(null) : back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Chatbot admin</Text>
        <View style={styles.iconSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!config.loaded ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : editing ? (
            <PersonaEditor
              key={editing === "new" ? "new" : editing.id}
              persona={editing === "new" ? null : editing}
              onSave={savePersona}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <>
              <View style={styles.intro}>
                <Text style={[styles.title, { color: colors.foreground }]}>Personas</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>
                  Each persona has its own system prompt and model settings. Pick one on the chatbot page to chat with it.
                </Text>
              </View>

              {notice ? (
                <Text accessibilityLiveRegion="polite" style={[styles.notice, { color: colors.tone.emerald.fg }]}>
                  {notice}
                </Text>
              ) : null}

              <Pressable
                onPress={() => setEditing("new")}
                accessibilityRole="button"
                accessibilityLabel="New persona"
                style={({ pressed }) => [styles.newButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
              >
                <Plus size={18} color={colors.primaryForeground} />
                <Text style={[styles.newButtonText, { color: colors.primaryForeground }]}>New persona</Text>
              </Pressable>

              {config.personas.map((persona) => {
                const isDefault = persona.id === config.settings.defaultPersonaId;
                return (
                  <View key={persona.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardTop}>
                      <PersonaAvatar emoji={persona.avatar} size={40} />
                      <View style={styles.cardText}>
                        <View style={styles.nameRow}>
                          <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>
                            {persona.name}
                          </Text>
                          {isDefault ? (
                            <Text style={[styles.badge, { color: colors.tone.emerald.fg, borderColor: colors.border }]}>Default</Text>
                          ) : null}
                        </View>
                        <Text numberOfLines={2} style={[styles.hint, { color: colors.mutedForeground }]}>
                          {persona.description || "No description"}
                        </Text>
                        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                          {persona.model || "Chat model"} · temp {persona.temperature.toFixed(2)} · top P {persona.topP.toFixed(2)}
                          {persona.maxTokens > 0 ? ` · ${persona.maxTokens} tokens` : ""}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <ActionLink label="Edit" icon={Pencil} onPress={() => setEditing(persona)} />
                      {!isDefault ? <ActionLink label="Make default" icon={Check} onPress={() => makeDefault(persona)} /> : null}
                      <ActionLink label="Duplicate" icon={Copy} onPress={() => duplicate(persona)} />
                      <ActionLink label="Delete" icon={Trash2} danger onPress={() => remove(persona)} />
                    </View>
                  </View>
                );
              })}

              <ChatbotSettingsCard
                settings={config.settings}
                personas={config.personas}
                speechReady={speechReady}
                onSave={(next) => config.saveSettingsValues(next)}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ActionLink({
  label,
  icon: Icon,
  onPress,
  danger = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  danger?: boolean;
}): ReactNode {
  const colors = useThemeColors();
  const tint = danger ? colors.destructive : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.actionLink, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon size={14} color={tint} />
      <Text style={[styles.actionText, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 40,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.xl,
  },
  loading: {
    paddingVertical: spacing["2xl"],
    alignItems: "center",
  },
  intro: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  notice: {
    fontSize: 14,
    textAlign: "center",
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.full,
  },
  newButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    fontSize: 11,
    fontWeight: "600",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
