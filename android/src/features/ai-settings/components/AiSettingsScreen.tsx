// src/features/ai-settings/components/AiSettingsScreen.tsx
/**
 * Settings page: the AI model connection first, then voice input and text to speech. Separate
 * connections for those two sit behind an advanced disclosure that opens by itself when they already
 * have values. Appearance comes last. Save is in the footer and is enabled only when something changed.
 * Loading and save status are announced through live regions.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Eye, EyeOff, MessageSquare, Mic, Network, Save, Volume2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
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
  const hasSeparateConnection =
    settings.transcriptionBaseUrl !== "" ||
    settings.transcriptionApiKey !== "" ||
    settings.ttsBaseUrl !== "" ||
    settings.ttsApiKey !== "";

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
      <View accessibilityLiveRegion="polite" style={styles.status}>
        <ErrorText message={error} />
        {!error && saved && !dirty ? (
          <Text style={[styles.saved, { color: colors.tone.emerald.fg }]}>Saved. Your AI settings are stored on this device.</Text>
        ) : null}
      </View>
      {!dirty && !saved ? <Text style={[styles.note, { color: colors.mutedForeground }]}>Change a setting to enable saving.</Text> : null}
      <ActionButton
        label={busy ? "Saving AI settings…" : "Save AI settings"}
        icon={Save}
        loading={busy}
        disabled={!dirty}
        onPress={handleSave}
      />
    </View>
  ) : undefined;

  return (
    <ToolScreen title="Settings" usesAi={false} footer={footer} wide>
      {!loaded ? (
        <View accessibilityLiveRegion="polite" style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.note, { color: colors.mutedForeground }]}>Loading settings…</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>
            Used by every feature that calls an AI model. Stored only on this device.
          </Text>

          <Panel>
            <SectionHeading
              icon={MessageSquare}
              title="AI model"
              description="The chat model that writes replies and generated text."
            />
            <TextField
              label="Model name"
              hint="The exact name your provider lists for this model."
              placeholder="e.g. gpt-4o-mini"
              value={form.modelName}
              onChangeText={(text) => update("modelName", text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <SecretField
              label="API key"
              hint="Your provider's secret key. Keep it private."
              value={form.apiKey}
              onChangeText={(text) => update("apiKey", text)}
            />
            <TextField
              label="Base URL"
              hint="Optional. Leave empty to use your provider's default address."
              placeholder="e.g. https://openrouter.ai/api/v1"
              value={form.baseUrl}
              onChangeText={(text) => update("baseUrl", text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </Panel>

          <Panel>
            <SectionHeading icon={Mic} title="Voice input" description="Turns your spoken answers into text." />
            <SelectField
              label="Voice model"
              options={VOICE_MODEL_OPTIONS}
              value={form.transcriptionModel}
              onChange={(value) => update("transcriptionModel", value)}
              customPlaceholder="Speech-to-text model name"
            />
          </Panel>

          <Panel>
            <SectionHeading icon={Volume2} title="Text to speech" description="Reads generated text aloud." />
            <SelectField
              label="Speech model"
              options={TTS_MODEL_OPTIONS}
              value={form.ttsModel}
              onChange={(value) => update("ttsModel", value)}
              customPlaceholder="Text-to-speech model name"
            />
            <SelectField
              label="Speech voice"
              options={TTS_VOICE_OPTIONS}
              value={form.ttsVoice}
              onChange={(value) => update("ttsVoice", value)}
              customPlaceholder="Voice name, for example Zephyr"
            />
          </Panel>

          <Disclosure
            title="Advanced connections"
            icon={Network}
            summary="Optional. Use a different server or key for voice input or speech. Empty fields use the chat settings."
            defaultOpen={hasSeparateConnection}
          >
            <View style={styles.group}>
              <Text accessibilityRole="header" style={[styles.subheading, { color: colors.foreground }]}>
                Voice input
              </Text>
              <TextField
                label="Voice base URL"
                accessibilityLabel="Voice base URL, optional"
                hint="Leave empty to use the chat base URL."
                placeholder="Same as the chat base URL"
                value={form.transcriptionBaseUrl}
                onChangeText={(text) => update("transcriptionBaseUrl", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <SecretField
                label="Voice API key"
                hint="Leave empty to use the chat API key."
                placeholder="Same as the chat API key"
                value={form.transcriptionApiKey}
                onChangeText={(text) => update("transcriptionApiKey", text)}
              />
            </View>

            <View style={styles.group}>
              <Text accessibilityRole="header" style={[styles.subheading, { color: colors.foreground }]}>
                Text to speech
              </Text>
              <TextField
                label="Speech base URL"
                accessibilityLabel="Speech base URL, optional"
                hint="Leave empty to use the chat base URL."
                placeholder="Same as the chat base URL"
                value={form.ttsBaseUrl}
                onChangeText={(text) => update("ttsBaseUrl", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <SecretField
                label="Speech API key"
                hint="Leave empty to use the chat API key."
                placeholder="Same as the chat API key"
                value={form.ttsApiKey}
                onChangeText={(text) => update("ttsApiKey", text)}
              />
            </View>
          </Disclosure>

          <AppearanceSettings />
        </>
      )}
    </ToolScreen>
  );
}

function trimUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.heading}>
      <SectionTitle icon={icon} title={title} />
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
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
          accessibilityLabel={label}
          accessibilityHint={hint}
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
    gap: spacing.sm,
  },
  heading: {
    gap: spacing.xs,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  subheading: {
    fontSize: 15,
    fontWeight: "600",
  },
  group: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  status: {
    gap: spacing.xs,
  },
  saved: {
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
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
});
