// src/features/ai-settings/components/AiSettingsScreen.tsx
/**
 * Settings page: the AI model connection first, then voice input and text to speech. Separate
 * connections for those two sit behind an advanced disclosure that opens by itself when they already
 * have values. Appearance comes last. Every change saves to the device after a short pause, so there
 * is no save button. A value that is not valid is shown in place and is not saved.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Eye, EyeOff, MessageSquare, Mic, Network, Volume2, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import { ErrorText, Field, Panel, TextField, ActionButton } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { AppearanceSettings } from "@/features/theme-settings/components/AppearanceSettings";
import { useAiSettings } from "../providers/AiSettingsProvider";
import { VOICE_MODEL_OPTIONS } from "../lib/voice";
import { TTS_MODEL_OPTIONS, TTS_VOICE_OPTIONS } from "../lib/speech";
import type { AiSettings } from "../types";

const URL_PATTERN = /^https?:\/\/\S+$/i;
const SAVE_DELAY_MS = 400;
const SKELETON_DELAY_MS = 300;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AiSettingsScreen() {
  const colors = useThemeColors();
  const { settings, loaded, saveSettings } = useAiSettings();

  const [form, setForm] = useState<AiSettings>(settings);
  const [hydrated, setHydrated] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pending = useRef<AiSettings | null>(null);

  useEffect(() => {
    if (loaded && !hydrated) {
      setForm(settings);
      setHydrated(true);
    }
  }, [loaded, hydrated, settings]);

  useEffect(() => {
    if (hydrated) return;
    const timer = setTimeout(() => setShowSkeleton(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hydrated]);

  const commit = useCallback(
    async (next: AiSettings) => {
      pending.current = null;
      setStatus("saving");
      try {
        await saveSettings(next);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [saveSettings]
  );

  useEffect(() => {
    if (!hydrated) return;
    const next = normalizeSettings(form);
    const message = validateSettings(next);
    setProblem(message);
    if (message || isSameSettings(next, settings)) {
      pending.current = null;
      return;
    }
    pending.current = next;
    const timer = setTimeout(() => void commit(next), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [form, hydrated, settings, commit]);

  useEffect(() => {
    return () => {
      if (pending.current) void saveSettings(pending.current);
    };
  }, [saveSettings]);

  const hasSeparateConnection =
    settings.transcriptionBaseUrl !== "" ||
    settings.transcriptionApiKey !== "" ||
    settings.ttsBaseUrl !== "" ||
    settings.ttsApiKey !== "";

  function update<K extends keyof AiSettings>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function retry() {
    const next = normalizeSettings(form);
    if (!validateSettings(next)) void commit(next);
  }

  return (
    <ToolScreen title="Settings" usesAi={false}>
      {!hydrated ? (
        showSkeleton ? <SettingsSkeleton /> : null
      ) : (
        <>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>
            Used by every feature that calls an AI model. Changes save to this device as you make them.
          </Text>

          <View accessibilityLiveRegion="polite" style={styles.status}>
            {problem ? (
              <ErrorText message={problem} />
            ) : status === "saving" ? (
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Saving…</Text>
            ) : status === "saved" ? (
              <View style={styles.statusRow}>
                <Check size={16} color={colors.tone.emerald.fg} />
                <Text style={[styles.statusText, { color: colors.tone.emerald.fg }]}>Saved on this device.</Text>
              </View>
            ) : status === "error" ? (
              <View style={styles.statusStack}>
                <ErrorText message="Could not save settings. Check your device storage, then try again." />
                <ActionButton label="Try saving again" variant="outline" onPress={retry} />
              </View>
            ) : null}
          </View>

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
              style={styles.field}
            />
            <SecretField
              label="API key"
              hint="Your provider's secret key. Keep it private."
              value={form.apiKey}
              onChangeText={(text) => update("apiKey", text)}
            />
            <TextField
              label="Base URL (optional)"
              hint="Leave empty to use your provider's default address."
              placeholder="e.g. https://openrouter.ai/api/v1"
              value={form.baseUrl}
              onChangeText={(text) => update("baseUrl", text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.field}
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
                label="Voice base URL (optional)"
                hint="Leave empty to use the chat base URL."
                placeholder="Same as the chat base URL"
                value={form.transcriptionBaseUrl}
                onChangeText={(text) => update("transcriptionBaseUrl", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.field}
              />
              <SecretField
                label="Voice API key (optional)"
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
                label="Speech base URL (optional)"
                hint="Leave empty to use the chat base URL."
                placeholder="Same as the chat base URL"
                value={form.ttsBaseUrl}
                onChangeText={(text) => update("ttsBaseUrl", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.field}
              />
              <SecretField
                label="Speech API key (optional)"
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

function normalizeSettings(form: AiSettings): AiSettings {
  return {
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
}

function validateSettings(next: AiSettings): string | null {
  if (next.baseUrl && !URL_PATTERN.test(next.baseUrl)) return "Base URL must start with http:// or https://";
  if (next.transcriptionBaseUrl && !URL_PATTERN.test(next.transcriptionBaseUrl)) {
    return "Voice base URL must start with http:// or https://";
  }
  if (next.ttsBaseUrl && !URL_PATTERN.test(next.ttsBaseUrl)) return "Speech base URL must start with http:// or https://";
  return null;
}

function isSameSettings(first: AiSettings, second: AiSettings): boolean {
  return (Object.keys(first) as (keyof AiSettings)[]).every((key) => first[key] === second[key]);
}

function trimUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function SettingsSkeleton() {
  const colors = useThemeColors();
  return (
    <View accessibilityLabel="Loading settings" style={styles.skeleton}>
      {[200, 140, 140].map((height, index) => (
        <View key={index} style={[styles.skeletonBlock, { height, backgroundColor: colors.muted }]} />
      ))}
    </View>
  );
}

function SectionHeading({
  icon: Icon,
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
      <View style={styles.headingRow}>
        <View style={[styles.headingIcon, { backgroundColor: colors.muted }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
      </View>
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
          {visible ? <EyeOff size={20} color={colors.foreground} /> : <Eye size={20} color={colors.foreground} />}
        </Pressable>
      </View>
    </Field>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typeScale.body,
  },
  status: {
    minHeight: 24,
    justifyContent: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusStack: {
    gap: spacing.sm,
  },
  statusText: {
    ...typeScale.label,
  },
  skeleton: {
    gap: spacing.lg,
  },
  skeletonBlock: {
    borderRadius: shape.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headingIcon: {
    width: 40,
    height: 40,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    ...typeScale.title,
  },
  description: {
    ...typeScale.label,
    fontWeight: "400",
  },
  subheading: {
    ...typeScale.title,
    fontSize: 15,
  },
  group: {
    gap: spacing.lg,
  },
  field: {
    minHeight: 56,
  },
  input: {
    borderWidth: 1,
    borderRadius: shape.lg,
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
    minHeight: 56,
  },
  toggle: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
