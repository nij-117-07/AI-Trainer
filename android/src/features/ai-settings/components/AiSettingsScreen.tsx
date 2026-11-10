// src/features/ai-settings/components/AiSettingsScreen.tsx
/**
 * Settings page: appearance, then the AI connections. Each connection card shows its main fields
 * first. The optional separate base URL and key for voice and speech sit behind a toggle that
 * opens by itself when they already have values. Save is in the footer and is enabled only when
 * something changed.
 */
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ChevronDown, ChevronUp, Eye, EyeOff, MessageSquare, Mic, Save, Volume2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { AppearanceSettings } from "@/features/theme-settings/components/AppearanceSettings";
import { useAiSettings } from "../providers/AiSettingsProvider";
import { VOICE_MODEL_OPTIONS } from "../lib/voice";
import { TTS_MODEL_OPTIONS, TTS_VOICE_OPTIONS } from "../lib/speech";
import type { AiSettings } from "../types";

const URL_PATTERN = /^https?:\/\/\S+$/i;

export function AiSettingsScreen() {
  const colors = useThemeColors();
  const { settings, loaded, saveSettings } = useAiSettings();

  const [form, setForm] = useState<AiSettings>(settings);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loaded) setForm(settings);
  }, [loaded, settings]);

  const dirty = loaded && JSON.stringify(form) !== JSON.stringify(settings);

  function update<K extends keyof AiSettings>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    const next: AiSettings = {
      modelName: form.modelName.trim(),
      apiKey: form.apiKey.trim(),
      baseUrl: trimUrl(form.baseUrl),
      transcriptionModel: form.transcriptionModel.trim(),
      transcriptionBaseUrl: trimUrl(form.transcriptionBaseUrl),
      transcriptionApiKey: form.transcriptionApiKey.trim(),
      ttsModel: form.ttsModel.trim(),
      ttsVoice: form.ttsVoice.trim(),
      ttsBaseUrl: trimUrl(form.ttsBaseUrl),
      ttsApiKey: form.ttsApiKey.trim(),
    };
    if (next.baseUrl && !URL_PATTERN.test(next.baseUrl)) {
      setError("Base URL must start with http:// or https://");
      return;
    }
    if (next.transcriptionBaseUrl && !URL_PATTERN.test(next.transcriptionBaseUrl)) {
      setError("Voice base URL must start with http:// or https://");
      return;
    }
    if (next.ttsBaseUrl && !URL_PATTERN.test(next.ttsBaseUrl)) {
      setError("Speech base URL must start with http:// or https://");
      return;
    }
    setBusy(true);
    try {
      await saveSettings(next);
      setForm(next);
      setSaved(true);
    } catch {
      setError("Could not save settings. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const footer = loaded ? (
    <View style={styles.footer}>
      <ErrorText message={error} />
      {!error && saved && !dirty ? (
        <Text style={[styles.saved, { color: colors.tone.emerald.fg }]} accessibilityLiveRegion="polite">
          Settings saved.
        </Text>
      ) : null}
      <ActionButton label="Save settings" icon={Save} loading={busy} disabled={!dirty} onPress={handleSave} />
    </View>
  ) : undefined;

  return (
    <ToolScreen title="Settings" usesAi={false} footer={footer}>
      <AppearanceSettings />

      {!loaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>
            These connections are used by every feature that calls an AI model. They are stored only on this device.
          </Text>

          <Panel>
            <SectionTitle icon={MessageSquare} title="Chat model" />
            <TextField
              label="Model name"
              hint="The model that writes replies and generated text."
              placeholder="e.g. gpt-4o-mini"
              value={form.modelName}
              onChangeText={(text) => update("modelName", text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <SecretField
              label="API key"
              hint="Sent as the Authorization header. Keep it private."
              value={form.apiKey}
              onChangeText={(text) => update("apiKey", text)}
            />
            <TextField
              label="Base URL"
              hint="Leave empty for the provider default."
              placeholder="e.g. https://openrouter.ai/api/v1"
              value={form.baseUrl}
              onChangeText={(text) => update("baseUrl", text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </Panel>

          <Panel>
            <SectionTitle icon={Mic} title="Voice input" />
            <SelectField
              label="Voice model"
              options={VOICE_MODEL_OPTIONS}
              value={form.transcriptionModel}
              onChange={(value) => update("transcriptionModel", value)}
              customPlaceholder="Speech-to-text model name"
            />
            <SeparateConnection
              hint="Optional. Empty uses the chat base URL and key."
              startOpen={form.transcriptionBaseUrl !== "" || form.transcriptionApiKey !== ""}
            >
              <TextField
                label="Voice base URL"
                placeholder="Same as the chat base URL"
                value={form.transcriptionBaseUrl}
                onChangeText={(text) => update("transcriptionBaseUrl", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <SecretField
                label="Voice API key"
                placeholder="Same as the chat API key"
                value={form.transcriptionApiKey}
                onChangeText={(text) => update("transcriptionApiKey", text)}
              />
            </SeparateConnection>
          </Panel>

          <Panel>
            <SectionTitle icon={Volume2} title="Text to speech" />
            <SelectField
              label="Speech model"
              options={TTS_MODEL_OPTIONS}
              value={form.ttsModel}
              onChange={(value) => update("ttsModel", value)}
              customPlaceholder="Text-to-speech model name"
            />
            <SelectField
              label="Voice"
              options={TTS_VOICE_OPTIONS}
              value={form.ttsVoice}
              onChange={(value) => update("ttsVoice", value)}
              customPlaceholder="Voice name, for example Zephyr"
            />
            <SeparateConnection
              hint="Optional. Empty uses the chat base URL and key."
              startOpen={form.ttsBaseUrl !== "" || form.ttsApiKey !== ""}
            >
              <TextField
                label="Speech base URL"
                placeholder="Same as the chat base URL"
                value={form.ttsBaseUrl}
                onChangeText={(text) => update("ttsBaseUrl", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <SecretField
                label="Speech API key"
                placeholder="Same as the chat API key"
                value={form.ttsApiKey}
                onChangeText={(text) => update("ttsApiKey", text)}
              />
            </SeparateConnection>
          </Panel>
        </>
      )}
    </ToolScreen>
  );
}

function trimUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function SeparateConnection({ hint, startOpen, children }: { hint: string; startOpen: boolean; children: ReactNode }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(startOpen);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View style={[styles.separate, { borderTopColor: colors.border }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel="Separate connection"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.separateToggle, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.separateText}>
          <Text style={[styles.separateTitle, { color: colors.foreground }]}>Separate connection</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
        </View>
        <Chevron size={18} color={colors.mutedForeground} />
      </Pressable>
      {open ? <View style={styles.separateFields}>{children}</View> : null}
    </View>
  );
}

function SecretField({
  label,
  hint,
  value,
  onChangeText,
  placeholder = "API key",
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <View style={styles.keyRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!visible}
          style={[styles.input, styles.keyInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <Pressable
          onPress={() => setVisible((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
          style={({ pressed }) => [styles.toggle, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          {visible ? <EyeOff size={18} color={colors.foreground} /> : <Eye size={18} color={colors.foreground} />}
        </Pressable>
      </View>
    </Field>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 20,
  },
  loading: {
    paddingVertical: spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    gap: spacing.sm,
  },
  saved: {
    fontSize: 14,
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  keyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  keyInput: {
    flex: 1,
  },
  toggle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  separate: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  separateToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  separateText: {
    flex: 1,
    gap: spacing.xs,
  },
  separateTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  separateFields: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
});
