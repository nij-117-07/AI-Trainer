// src/features/chatbot/components/ChatbotAdminScreen.tsx
/** Chatbot admin: create, edit, duplicate, and delete personas, and set chat-wide defaults. */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Bot, Check, Copy, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react-native";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ActionButton, ErrorText, pointerCursor } from "@/components/tool/FormControls";
import { cardPadding, contentWidth, shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
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
  const { size } = useLayout();
  const config = useChatbotConfig();
  const { settings: aiSettings } = useAiSettings();
  const speechReady = isSpeechConfigured(resolveSpeechConnection(aiSettings));
  const [editing, setEditing] = useState<Persona | "new" | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const busy = status?.tone === "busy";
  const sideBySide = size === "desktop";
  const cardPad = size === "phone" ? cardPadding.compact : cardPadding.medium;

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
    <ToolScreen title="Chatbot admin" usesAi={false} wide>
      {!config.loaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Loading personas…</Text>
        </View>
      ) : editing ? (
        <View style={[styles.stack, styles.centered, { maxWidth: contentWidth.form }]}>
          <ActionButton label="Back to personas" icon={ArrowLeft} variant="outline" onPress={() => setEditing(null)} />
          <PersonaEditor
            key={editing === "new" ? "new" : editing.id}
            persona={editing === "new" ? null : editing}
            onSave={savePersona}
            onCancel={() => setEditing(null)}
          />
        </View>
      ) : (
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
                    <View
                      key={persona.id}
                      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: cardPad }]}
                    >
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
      )}
    </ToolScreen>
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
        { borderColor: danger ? colors.destructive : colors.border },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={18} color={tint} />
      <Text style={[styles.actionText, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    ...typeScale.headline,
  },
  description: {
    ...typeScale.body,
  },
  status: {
    ...typeScale.label,
  },
  hint: {
    ...typeScale.caption,
  },
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
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
    ...typeScale.bodyLarge,
    fontWeight: "600",
  },
  badge: {
    ...typeScale.caption,
    fontWeight: "600",
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});
