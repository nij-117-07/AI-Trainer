// src/features/chatbot/components/ChatbotAdminScreen.tsx
/** Chatbot admin: create, edit, duplicate, and delete personas, and set chat-wide defaults. */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Bot, Check, Copy, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react-native";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ActionButton, ErrorText, pointerCursor } from "@/components/tool/FormControls";
import { contentWidth, radius, spacing, useLayout, useThemeColors } from "@/theme";
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

type Status = { tone: "busy" | "ok" | "error"; text: string };

export function ChatbotAdminScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { size } = useLayout();
  const config = useChatbotConfig();
  const { settings: aiSettings } = useAiSettings();
  const speechReady = isSpeechConfigured(resolveSpeechConnection(aiSettings));
  const [editing, setEditing] = useState<Persona | "new" | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const busy = status?.tone === "busy";
  const sideBySide = size === "desktop";

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/tools");
  };

  async function attempt(action: () => Promise<void>, success: string) {
    setStatus({ tone: "busy", text: "Working…" });
    try {
      await action();
      setStatus({ tone: "ok", text: success });
    } catch (cause) {
      setStatus({ tone: "error", text: cause instanceof Error ? cause.message : "The change could not be saved." });
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
    setStatus({ tone: "ok", text: existing ? `Saved ${draft.name.trim()}.` : `Created ${draft.name.trim()}.` });
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
      setStatus({ tone: "error", text: "Keep at least one persona. Create another before deleting this one." });
      return;
    }
    confirmAction(
      `Delete ${persona.name}?`,
      "Its chats will be removed from this device. This can't be undone.",
      () => {
        void attempt(async () => {
          await removeChatsForPersona(persona.id);
          await config.savePersonaList(config.personas.filter((p) => p.id !== persona.id));
          if (config.settings.defaultPersonaId === persona.id) {
            await config.saveSettingsValues({ ...config.settings, defaultPersonaId: "" });
          }
        }, `Deleted ${persona.name}.`);
      },
    );
  }

  const statusColor =
    status?.tone === "error" ? colors.destructive : status?.tone === "ok" ? colors.tone.emerald.fg : colors.mutedForeground;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={editing ? () => setEditing(null) : back}
          accessibilityRole="button"
          accessibilityLabel={editing ? "Back to personas" : "Go back"}
          style={({ pressed }) => [
            styles.iconButton,
            pointerCursor,
            { borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text accessibilityRole="header" numberOfLines={1} style={[styles.headerTitle, { color: colors.foreground }]}>
          Chatbot admin
        </Text>
        <View style={styles.iconSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!config.loaded ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Loading personas…</Text>
            </View>
          ) : editing ? (
            <View style={[styles.centered, { maxWidth: contentWidth.form }]}>
              <PersonaEditor
                key={editing === "new" ? "new" : editing.id}
                persona={editing === "new" ? null : editing}
                onSave={savePersona}
                onCancel={() => setEditing(null)}
              />
            </View>
          ) : (
            <View style={[styles.centered, { maxWidth: size === "phone" ? undefined : contentWidth.wide }]}>
              <View style={sideBySide ? styles.split : styles.stack}>
                <View style={[styles.stack, sideBySide && styles.grow]}>
                  <View style={styles.intro}>
                    <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
                      Personas
                    </Text>
                    <Text style={[styles.description, { color: colors.mutedForeground }]}>
                      Each persona has its own instructions and model settings. Pick one on the chatbot page to chat with it.
                    </Text>
                  </View>

                  <ErrorText message={config.loadError} />

                  {status ? (
                    <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor }]}>
                      {status.text}
                    </Text>
                  ) : null}

                  <ActionButton label="New persona" icon={Plus} onPress={() => setEditing("new")} disabled={busy} />

                  {config.personas.length === 0 ? (
                    config.loadError ? null : (
                      <EmptyHint icon={Bot} title="No personas yet" hint="Create a persona to start chatting." />
                    )
                  ) : (
                    <CardGrid>
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
                                  {persona.description || "No description yet"}
                                </Text>
                                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                                  {persona.model || "Model from AI settings"} · Temp {persona.temperature.toFixed(2)} · Top P{" "}
                                  {persona.topP.toFixed(2)}
                                  {persona.maxTokens > 0 ? ` · ${persona.maxTokens} max tokens` : ""}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.actions}>
                              <ActionLink
                                label="Edit"
                                accessibilityLabel={`Edit ${persona.name}`}
                                icon={Pencil}
                                disabled={busy}
                                onPress={() => setEditing(persona)}
                              />
                              {!isDefault ? (
                                <ActionLink
                                  label="Make default"
                                  accessibilityLabel={`Make ${persona.name} the default persona`}
                                  icon={Check}
                                  disabled={busy}
                                  onPress={() => makeDefault(persona)}
                                />
                              ) : null}
                              <ActionLink
                                label="Duplicate"
                                accessibilityLabel={`Duplicate ${persona.name}`}
                                icon={Copy}
                                disabled={busy}
                                onPress={() => duplicate(persona)}
                              />
                              <ActionLink
                                label="Delete"
                                accessibilityLabel={`Delete ${persona.name}`}
                                icon={Trash2}
                                danger
                                disabled={busy}
                                onPress={() => remove(persona)}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </CardGrid>
                  )}
                </View>

                <View style={sideBySide ? styles.sidePane : [styles.centered, { maxWidth: contentWidth.form }]}>
                  <ChatbotSettingsCard
                    settings={config.settings}
                    personas={config.personas}
                    speechReady={speechReady}
                    onSave={(next) => config.saveSettingsValues(next)}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ActionLink({
  label,
  accessibilityLabel,
  icon: Icon,
  onPress,
  disabled = false,
  danger = false,
}: {
  label: string;
  accessibilityLabel: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}): ReactNode {
  const colors = useThemeColors();
  const tint = danger ? colors.destructive : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.actionLink,
        pointerCursor,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
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
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 44,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  centered: {
    width: "100%",
    alignSelf: "center",
  },
  stack: {
    gap: spacing.xl,
  },
  split: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xl,
  },
  grow: {
    flex: 1,
  },
  sidePane: {
    width: contentWidth.sidePanel,
  },
  loading: {
    paddingVertical: spacing["2xl"],
    alignItems: "center",
    gap: spacing.md,
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
  status: {
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
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
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});
