// src/features/ai-settings/components/AiSettingsScreen.tsx
/**
 * Admin settings for the AI connections: the chat model (model name, API key, base URL) and the
 * voice model used for speech-to-text (model, and an optional separate base URL and API key).
 * Applications in this app read these values through useAiSettings().
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Eye, EyeOff, Mic, Save, Volume2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useGoBack } from "@/lib/navigation";
import { AppearanceSettings } from "@/features/theme-settings/components/AppearanceSettings";
import { SelectField } from "@/components/tool/SelectField";
import { useAiSettings } from "../providers/AiSettingsProvider";
import { VOICE_MODEL_OPTIONS } from "../lib/voice";
import { TTS_MODEL_OPTIONS, TTS_VOICE_OPTIONS } from "../lib/speech";
import type { AiSettings } from "../types";

const URL_PATTERN = /^https?:\/\/\S+$/i;

export function AiSettingsScreen() {
  const colors = useThemeColors();
  const goBack = useGoBack();
  const { settings, loaded, saveSettings } = useAiSettings();

  const [form, setForm] = useState<AiSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [showVoiceKey, setShowVoiceKey] = useState(false);
  const [showTtsKey, setShowTtsKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loaded) setForm(settings);
  }, [loaded, settings]);

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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={styles.iconButtonSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppearanceSettings />

          {!loaded ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.intro}>
                <Text style={[styles.title, { color: colors.foreground }]}>Model connection</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>
                  These values are used by every application that calls an AI model. They are stored only on this device.
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Chat model</Text>

                <Field label="Model name" hint="For example: gpt-4o-mini or claude-haiku-5-5">
                  <TextInput
                    value={form.modelName}
                    onChangeText={(text) => update("modelName", text)}
                    placeholder="Model name"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                </Field>

                <SecretField
                  label="API key"
                  hint="Sent as the Authorization header. Keep it private."
                  value={form.apiKey}
                  onChangeText={(text) => update("apiKey", text)}
                  visible={showKey}
                  onToggleVisible={() => setShowKey((prev) => !prev)}
                />

                <Field label="Base URL" hint="For example: https://openrouter.ai/api/v1. Leave empty for the provider default.">
                  <TextInput
                    value={form.baseUrl}
                    onChangeText={(text) => update("baseUrl", text)}
                    placeholder="https://api.example.com/v1"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                </Field>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Mic size={18} color={colors.foreground} />
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Voice model</Text>
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  The speech-to-text model used by voice input. Its base URL and key are optional. Leave them empty to use the chat connection above.
                </Text>

                <SelectField
                  label="Voice model"
                  options={VOICE_MODEL_OPTIONS}
                  value={form.transcriptionModel}
                  onChange={(value) => update("transcriptionModel", value)}
                  customPlaceholder="Speech-to-text model name"
                />

                <Field label="Voice base URL" hint="Optional. For example: https://openrouter.ai/api/v1. Empty uses the chat base URL.">
                  <TextInput
                    value={form.transcriptionBaseUrl}
                    onChangeText={(text) => update("transcriptionBaseUrl", text)}
                    placeholder="Same as the chat base URL"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                </Field>

                <SecretField
                  label="Voice API key"
                  hint="Optional. Empty uses the chat API key."
                  value={form.transcriptionApiKey}
                  onChangeText={(text) => update("transcriptionApiKey", text)}
                  visible={showVoiceKey}
                  onToggleVisible={() => setShowVoiceKey((prev) => !prev)}
                  placeholder="Same as the chat API key"
                />
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Volume2 size={18} color={colors.foreground} />
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Speech model</Text>
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  The text-to-speech model and voice used by the Text to Speech tool. The base URL and key are optional. Leave them empty to use the chat connection above.
                </Text>

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

                <Field label="Speech base URL" hint="Optional. For example: https://openrouter.ai/api/v1. Empty uses the chat base URL.">
                  <TextInput
                    value={form.ttsBaseUrl}
                    onChangeText={(text) => update("ttsBaseUrl", text)}
                    placeholder="Same as the chat base URL"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                </Field>

                <SecretField
                  label="Speech API key"
                  hint="Optional. Empty uses the chat API key."
                  value={form.ttsApiKey}
                  onChangeText={(text) => update("ttsApiKey", text)}
                  visible={showTtsKey}
                  onToggleVisible={() => setShowTtsKey((prev) => !prev)}
                  placeholder="Same as the chat API key"
                />
              </View>

              {error ? (
                <Text style={[styles.message, { color: colors.destructive }]} accessibilityLiveRegion="polite">
                  {error}
                </Text>
              ) : saved ? (
                <Text style={[styles.message, { color: colors.tone.emerald.fg }]} accessibilityLiveRegion="polite">
                  Settings saved.
                </Text>
              ) : null}

              <Pressable
                onPress={handleSave}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Save AI settings"
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                  busy && styles.disabled,
                ]}
              >
                <Save size={18} color={colors.primaryForeground} />
                <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save settings</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function trimUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {children}
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
    </View>
  );
}

function SecretField({
  label,
  hint,
  value,
  onChangeText,
  visible,
  onToggleVisible,
  placeholder = "API key",
}: {
  label: string;
  hint: string;
  value: string;
  onChangeText: (text: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
}) {
  const colors = useThemeColors();
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
          style={[
            styles.input,
            styles.keyInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
          ]}
        />
        <Pressable
          onPress={onToggleVisible}
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
  iconButtonSpacer: {
    width: 40,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.xl,
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
  card: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.xl,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
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
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.full,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
