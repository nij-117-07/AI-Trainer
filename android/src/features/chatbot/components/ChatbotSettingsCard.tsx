// src/features/chatbot/components/ChatbotSettingsCard.tsx
/** Chat-wide settings: the default persona, streaming, history length, and spoken replies. */
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { Disclosure } from "@/components/tool/Disclosure";
import { ActionButton, ChoiceChips, Field, Panel, TextField, pointerCursor } from "@/components/tool/FormControls";
import { spacing, useThemeColors } from "@/theme";
import { HISTORY_LIMIT_RANGE, validateHistoryLimit } from "../lib/settings-model";
import type { ChatbotSettings, Persona } from "../types";

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
  const [saving, setSaving] = useState(false);

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
    setMessage(null);
    setSaving(true);
    try {
      await onSave({ defaultPersonaId: defaultId, streamReplies: stream, historyLimit, autoSpeak });
      setMessage({ tone: "ok", text: "Chat settings saved." });
    } catch {
      setMessage({ tone: "error", text: "Chat settings could not be saved. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
        Chat settings
      </Text>

      <Field label="Default persona" hint="Opens first on the chatbot page.">
        <ChoiceChips
          options={personas.map((persona) => ({ value: persona.id, label: `${persona.avatar} ${persona.name}` }))}
          value={defaultId}
          onChange={setDefaultId}
        />
      </Field>

      <SwitchRow
        label="Stream replies"
        hint="Show the reply as it is written. Turn off to wait for the full reply."
        value={stream}
        onChange={setStream}
      />

      <SwitchRow
        label="Speak replies automatically"
        hint={
          speechReady
            ? "Each reply is read aloud when it finishes. You can also tap Listen on any reply."
            : "Needs a speech model and voice in AI settings. Tap Listen on a reply once they are set."
        }
        value={autoSpeak}
        onChange={setAutoSpeak}
      />

      <Disclosure title="Advanced settings" icon={SlidersHorizontal} summary={`Last ${historyText || "–"} messages sent with each reply`}>
        <TextField
          label="History length"
          hint={`Most recent messages sent with each reply, from ${HISTORY_LIMIT_RANGE.min} to ${HISTORY_LIMIT_RANGE.max}. Longer history uses more tokens.`}
          value={historyText}
          onChangeText={(value) => setHistoryText(value.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
        />
      </Disclosure>

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.message, { color: message.tone === "ok" ? colors.tone.emerald.fg : colors.destructive }]}
        >
          {message.text}
        </Text>
      ) : null}

      <ActionButton label="Save chat settings" loading={saving} onPress={() => void save()} />
    </Panel>
  );
}

function SwitchRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}): ReactNode {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [styles.switchRow, pointerCursor, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.switchText}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
      </View>
      <View style={styles.switchControl} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primary }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
  },
  switchText: {
    flex: 1,
    gap: spacing.xs,
  },
  switchControl: {
    pointerEvents: "none",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
