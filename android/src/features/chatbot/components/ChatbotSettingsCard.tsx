// src/features/chatbot/components/ChatbotSettingsCard.tsx
/** Chat-wide settings: the default persona, streaming, history length, and spoken replies. Every change is saved as it is made. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Check, SlidersHorizontal } from "lucide-react-native";
import { Disclosure } from "@/components/tool/Disclosure";
import { ChoiceChips, ErrorText, Field, Panel, TextField, pointerCursor } from "@/components/tool/FormControls";
import { spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { HISTORY_LIMIT_RANGE, validateHistoryLimit } from "../lib/settings-model";
import type { ChatbotSettings, Persona } from "../types";

interface ChatbotSettingsCardProps {
  settings: ChatbotSettings;
  personas: Persona[];
  speechReady: boolean;
  onSave: (next: ChatbotSettings) => Promise<void>;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const HISTORY_SAVE_DELAY_MS = 400;

export function ChatbotSettingsCard({ settings, personas, speechReady, onSave }: ChatbotSettingsCardProps) {
  const colors = useThemeColors();
  const [current, setCurrent] = useState(settings);
  const currentRef = useRef(settings);
  const [historyText, setHistoryText] = useState(String(settings.historyLimit));
  const historyTextRef = useRef(historyText);
  const [historyProblem, setHistoryProblem] = useState<string | null>(null);
  const historyDirty = useRef(false);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const written = useRef(new WeakSet<ChatbotSettings>());
  const writeCount = useRef(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    // Our own writes come back as props. Skip them so a newer edit is not overwritten.
    if (written.current.has(settings)) return;
    currentRef.current = settings;
    setCurrent(settings);
    if (!historyDirty.current) {
      historyTextRef.current = String(settings.historyLimit);
      setHistoryText(historyTextRef.current);
    }
  }, [settings]);

  async function persist(next: ChatbotSettings): Promise<boolean> {
    written.current.add(next);
    const id = ++writeCount.current;
    setSaveState("saving");
    const ok = await onSave(next).then(
      () => true,
      () => false,
    );
    if (id === writeCount.current) setSaveState(ok ? "saved" : "error");
    return ok;
  }

  function change(patch: Partial<ChatbotSettings>) {
    const next = { ...currentRef.current, ...patch };
    currentRef.current = next;
    setCurrent(next);
    return persist(next);
  }

  function flushHistory() {
    clearTimeout(historyTimer.current);
    if (!historyDirty.current) return;
    const historyLimit = Number(historyTextRef.current);
    if (validateHistoryLimit(historyLimit)) return;
    historyDirty.current = false;
    void change({ historyLimit }).then((ok) => {
      if (!ok) historyDirty.current = true;
    });
  }

  function editHistory(value: string) {
    const digits = value.replace(/[^0-9]/g, "");
    historyTextRef.current = digits;
    setHistoryText(digits);
    historyDirty.current = true;
    clearTimeout(historyTimer.current);
    const problem = validateHistoryLimit(Number(digits));
    setHistoryProblem(problem);
    if (!problem) historyTimer.current = setTimeout(flushHistory, HISTORY_SAVE_DELAY_MS);
  }

  return (
    <View style={styles.stack}>
      <Panel>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
          Chat settings
        </Text>

        <Field label="Default persona" hint="Opens first on the chatbot page.">
          <ChoiceChips
            options={personas.map((persona) => ({ value: persona.id, label: `${persona.avatar} ${persona.name}` }))}
            value={current.defaultPersonaId}
            onChange={(id) => void change({ defaultPersonaId: id })}
          />
        </Field>

        <SwitchRow
          label="Stream replies"
          hint="Show the reply as it is written. Turn off to wait for the full reply."
          value={current.streamReplies}
          onChange={(value) => void change({ streamReplies: value })}
        />

        <SwitchRow
          label="Speak replies automatically"
          hint={
            speechReady
              ? "Each reply is read aloud when it finishes. You can also tap Listen on any reply."
              : "Needs a speech model and voice in AI settings. Tap Listen on a reply once they are set."
          }
          value={current.autoSpeak}
          onChange={(value) => void change({ autoSpeak: value })}
        />

        <Disclosure title="Advanced settings" icon={SlidersHorizontal} summary={`Last ${historyText || "–"} messages sent with each reply`}>
          <TextField
            label="History length"
            hint={`Most recent messages sent with each reply, from ${HISTORY_LIMIT_RANGE.min} to ${HISTORY_LIMIT_RANGE.max}. Longer history uses more tokens.`}
            value={historyText}
            onChangeText={editHistory}
            onBlur={flushHistory}
            keyboardType="number-pad"
            style={styles.singleLine}
          />
          <ErrorText message={historyProblem} />
        </Disclosure>
      </Panel>

      {saveState !== "idle" ? (
        <View accessibilityLiveRegion="polite" style={styles.statusRow}>
          {saveState === "saving" ? <Text style={[styles.status, { color: colors.mutedForeground }]}>Saving…</Text> : null}
          {saveState === "saved" ? (
            <>
              <Check size={16} color={colors.tone.emerald.fg} />
              <Text style={[styles.status, { color: colors.tone.emerald.fg }]}>Saved on this device.</Text>
            </>
          ) : null}
          {saveState === "error" ? (
            <ErrorText message="Chat settings couldn't be saved. They'll try again." />
          ) : null}
        </View>
      ) : null}
    </View>
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
  stack: {
    gap: spacing.sm,
  },
  title: {
    ...typeScale.title,
  },
  label: {
    ...typeScale.body,
    fontWeight: "600",
  },
  hint: {
    ...typeScale.caption,
  },
  singleLine: {
    minHeight: 56,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget,
  },
  switchText: {
    flex: 1,
    gap: spacing.xs,
  },
  switchControl: {
    pointerEvents: "none",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  status: {
    ...typeScale.label,
  },
});
