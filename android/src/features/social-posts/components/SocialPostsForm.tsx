// src/features/social-posts/components/SocialPostsForm.tsx
/**
 * Social Media Post Generator form, shown on its own page. The fields fill the page body; the
 * generate button is pinned in the footer. A successful generate saves the result and calls
 * onGenerated, which returns to the Social Media Post Generator page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { useRequest } from "@/hooks/useRequest";
import { generateSocialPosts } from "../lib/generators";
import { PLATFORM_OPTIONS } from "../options";
import { saveSocialPostsResult, usePersistedForm } from "../hooks/usePersistedDraft";
import type { SocialPostFormValues } from "../types";

export interface SocialPostsFormState {
  form: SocialPostFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof SocialPostFormValues>(key: K, value: SocialPostFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useSocialPostsForm(onGenerated: () => void): SocialPostsFormState {
  const { settings } = useAiSettings();
  const { form, setForm, reset: resetForm } = usePersistedForm();
  const request = useRequest(generateSocialPosts);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof SocialPostFormValues>(key: K, value: SocialPostFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    resetForm();
    request.reset();
  }

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const result = await request.run(settings, form, controller.signal);
    if (!result || controller.signal.aborted) return;
    await saveSocialPostsResult(result).catch(() => undefined);
    onGenerated();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    update,
    submit,
    reset,
  };
}

export function SocialPostsFormFields({ posts }: { posts: SocialPostsFormState }) {
  const { form, pending, update } = posts;

  return (
    <>
      <SelectField
        label="Platform"
        options={PLATFORM_OPTIONS}
        value={form.platform}
        onChange={(value) => update("platform", value)}
        customPlaceholder="e.g. Pinterest, Mastodon"
      />
      <TextField
        label="Topic / goal"
        placeholder="e.g. The importance of failing fast in software development."
        value={form.userQuery}
        onChangeText={(text) => update("userQuery", text)}
        editable={!pending}
        maxLength={3000}
        multiline
        voice
      />
      <CountSlider
        label="Number of suggestions"
        max={10}
        value={form.numSuggestions}
        onChange={(value) => update("numSuggestions", value)}
      />
    </>
  );
}

export function SocialPostsFormFooter({ posts }: { posts: SocialPostsFormState }) {
  const { pending, error, submit } = posts;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing posts…" : "Generate posts"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});
