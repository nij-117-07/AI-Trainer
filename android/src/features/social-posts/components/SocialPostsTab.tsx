// src/features/social-posts/components/SocialPostsTab.tsx
/** Social Media Post Generator: platform-specific post variants with designer notes. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { Lightbulb, Megaphone, RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateSocialPosts } from "../lib/generators";
import { SOCIAL_POSTS_STORAGE_KEY } from "../lib/persistence";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { SocialPostFormValues, SocialPostResult } from "../types";

const DEFAULTS: SocialPostFormValues = {
  systemPrompt: "You are a witty, tech-savvy ghostwriter for SaaS founders on LinkedIn.",
  platform: "LinkedIn",
  userQuery: "The importance of failing fast in software development.",
  chatHistory: "",
  likedPostExamples: "",
  numSuggestions: 3,
};

export function SocialPostsTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<SocialPostFormValues, SocialPostResult>(
    SOCIAL_POSTS_STORAGE_KEY,
    DEFAULTS,
  );
  const request = useRequest(generateSocialPosts);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof SocialPostFormValues>(key: K, value: SocialPostFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    request.reset();
  }

  async function handleGenerate() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (next && !controller.signal.aborted) setResult(next);
  }

  const cancelled = controllerRef.current?.signal.aborted ?? false;

  return (
    <Section>
      <Panel>
        <TextField
          label="Brand voice / system prompt"
          placeholder="You are a witty, tech-savvy ghostwriter…"
          value={form.systemPrompt}
          onChangeText={(text) => update("systemPrompt", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Platform"
          placeholder="e.g. LinkedIn, X, Instagram, Thread"
          value={form.platform}
          onChangeText={(text) => update("platform", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <TextField
          label="Topic / goal"
          placeholder="The core topic or goal for the post…"
          value={form.userQuery}
          onChangeText={(text) => update("userQuery", text)}
          editable={!request.pending}
          maxLength={3000}
          multiline
        />
        <TextField
          label="Chat history (optional)"
          placeholder="Earlier context to keep the tone consistent…"
          value={form.chatHistory}
          onChangeText={(text) => update("chatHistory", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Liked post examples (optional)"
          placeholder="Posts you liked, for style matching…"
          value={form.likedPostExamples}
          onChangeText={(text) => update("likedPostExamples", text)}
          editable={!request.pending}
          maxLength={3000}
          multiline
        />
        <CountSlider
          label="Number of suggestions"
          max={10}
          value={form.numSuggestions}
          onChange={(value) => update("numSuggestions", value)}
        />
        <ActionButton
          label={request.pending ? "Writing posts…" : "Generate posts"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={cancelled ? null : request.error} />

      {result && (
        <>
          {result.userMessage !== "" && (
            <ResultCallout icon={Lightbulb} title="Strategy" tone="sky">
              <MarkdownText content={result.userMessage} />
            </ResultCallout>
          )}

          <SectionTitle icon={Megaphone} title="Post variants" />
          {result.postSuggestions.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No posts were returned.</Text>
          ) : (
            result.postSuggestions.map((post, index) => (
              <Panel key={`${post.variantId}-${index}`}>
                <Text style={[styles.title, { color: colors.foreground }]}>Variant {post.variantId}</Text>
                <MarkdownText content={post.content} />
                {post.designerNotes !== "" && (
                  <ResultCallout icon={Lightbulb} title="Designer notes" tone="emerald">
                    <MarkdownText content={post.designerNotes} />
                  </ResultCallout>
                )}
              </Panel>
            ))
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
