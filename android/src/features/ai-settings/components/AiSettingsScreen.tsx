// src/features/ai-settings/components/AiSettingsScreen.tsx
/**
 * Admin settings for the AI model connection: model name, API key, and base URL.
 * Applications in this app read these values through useAiSettings().
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { AppearanceSettings } from "@/features/theme-settings/components/AppearanceSettings";
import { useAiSettings } from "../providers/AiSettingsProvider";
import type { AiSettings } from "../types";

const URL_PATTERN = /^https?:\/\/\S+$/i;

export function AiSettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings, loaded, saveSettings } = useAiSettings();

  const [form, setForm] = useState<AiSettings>(settings);
  const [showKey, setShowKey] = useState(false);
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
      baseUrl: form.baseUrl.trim().replace(/\/+$/, ""),
    };
    if (next.baseUrl && !URL_PATTERN.test(next.baseUrl)) {
      setError("Base URL must start with http:// or https://");
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
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={styles.iconButtonSpacer} />
      </View>

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

            <Field label="API key" hint="Sent as the Authorization header. Keep it private.">
              <View style={styles.keyRow}>
                <TextInput
                  value={form.apiKey}
                  onChangeText={(text) => update("apiKey", text)}
                  placeholder="API key"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showKey}
                  style={[
                    styles.input,
                    styles.keyInput,
                    { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                />
                <Pressable
                  onPress={() => setShowKey((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityLabel={showKey ? "Hide API key" : "Show API key"}
                  style={({ pressed }) => [
                    styles.toggle,
                    { borderColor: colors.border },
                    pressed && { backgroundColor: colors.muted },
                  ]}
                >
                  {showKey ? (
                    <EyeOff size={18} color={colors.foreground} />
                  ) : (
                    <Eye size={18} color={colors.foreground} />
                  )}
                </Pressable>
              </View>
            </Field>

            <Field label="Base URL" hint="For example: https://api.openai.com/v1. Leave empty for the provider default.">
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
    </SafeAreaView>
  );
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
