// src/features/chatbot/components/ChatbotSettingsCard.tsx
/** Chat-wide settings: the default persona, streaming, history length, and spoken replies. */
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { HISTORY_LIMIT_RANGE, validateHistoryLimit } from "../lib/settings-model";
import type { ChatbotSettings, Persona } from "../types";
import { PersonaAvatar } from "./PersonaAvatar";

interface ChatbotSettingsCardProps {
  settings: ChatbotSettings;
  personas: Persona[];
  speechReady: boolean;
  onSave: (next: ChatbotSettings) => Promise<void>;
}

export function ChatbotSettingsCard({ settings, personas, speechReady, onSave }: ChatbotSettingsCardProps) {
  const colors = useThemeColors();
  const [defaultId, setDefaultId] = useState(settings.defaultPersonaId);
  const [stream, setStream] = useState(settings.streamReplies);
  const [autoSpeak, setAutoSpeak] = useState(settings.autoSpeak);
  const [historyText, setHistoryText] = useState(String(settings.historyLimit));
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setDefaultId(settings.defaultPersonaId);
    setStream(settings.streamReplies);
    setAutoSpeak(settings.autoSpeak);
    setHistoryText(String(settings.historyLimit));
  }, [settings]);

  async function save() {
    const historyLimit = Number(historyText.trim());
    const problem = validateHistoryLimit(historyLimit);
    if (problem) {
      setMessage({ tone: "error", text: problem });
      return;
    }
    try {
      await onSave({ defaultPersonaId: defaultId, streamReplies: stream, historyLimit, autoSpeak });
      setMessage({ tone: "ok", text: "Chat settings saved." });
    } catch {
      setMessage({ tone: "error", text: "Chat settings could not be saved." });
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Chat settings</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.foreground }]}>Default persona</Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Opens first on the chatbot page.</Text>
        <View style={styles.chips}>
          {personas.map((persona) => {
            const selected = persona.id === defaultId;
            return (
              <Pressable
                key={persona.id}
                onPress={() => setDefaultId(persona.id)}
                accessibilityRole="button"
                accessibilityLabel={`Default persona ${persona.name}`}
                accessibilityState={{ selected }}
                style={[
                  styles.chip,
                  { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.muted : colors.background },
                ]}
              >
                <PersonaAvatar emoji={persona.avatar} size={22} />
                <Text style={[styles.chipText, { color: colors.foreground }]}>{persona.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={[styles.label, { color: colors.foreground }]}>Stream replies</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Show the reply as it is written. Turn off to wait for the full reply.</Text>
        </View>
        <Switch
          value={stream}
          onValueChange={setStream}
          trackColor={{ false: colors.border, true: colors.primary }}
          accessibilityLabel="Stream replies"
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={[styles.label, { color: colors.foreground }]}>Speak replies automatically</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {speechReady
              ? "Each reply is read aloud when it finishes. You can also tap Listen on any reply."
              : "Needs the speech model and voice in AI settings. Tap Listen on a reply works the same way once they are set."}
          </Text>
        </View>
        <Switch
          value={autoSpeak}
          onValueChange={setAutoSpeak}
          trackColor={{ false: colors.border, true: colors.primary }}
          accessibilityLabel="Speak replies automatically"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.foreground }]}>History length</Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Most recent messages sent with each reply, from {HISTORY_LIMIT_RANGE.min} to {HISTORY_LIMIT_RANGE.max}. Longer history uses more tokens.
        </Text>
        <TextInput
          value={historyText}
          onChangeText={(value) => setHistoryText(value.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          accessibilityLabel="History length"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />
      </View>

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.message, { color: message.tone === "ok" ? colors.tone.emerald.fg : colors.destructive }]}
        >
          {message.text}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void save()}
        accessibilityRole="button"
        accessibilityLabel="Save chat settings"
        style={({ pressed }) => [styles.save, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save chat settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.xl,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  switchText: {
    flex: 1,
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
  save: {
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
