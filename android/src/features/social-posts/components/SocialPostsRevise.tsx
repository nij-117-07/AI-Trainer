// src/features/social-posts/components/SocialPostsRevise.tsx
/**
 * Revise page for one social post, shown on its own page. The post is shown read-only at the
 * top of the body, then the "Changes you want" field. A successful revision is added below its
 * source in the saved result, then the page returns to the results.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pencil, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { reviseSocialPost } from "../lib/generators";
import { newPostId } from "../lib/normalize";
import { loadSocialPostsResult, saveSocialPostsResult, usePersistedResult } from "../hooks/usePersistedDraft";
import type { SocialPost } from "../types";

export interface SocialPostRevisionState {
  source: SocialPost | null;
  loaded: boolean;
  changes: string;
  setChanges: (changes: string) => void;
  pending: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

export function useSocialPostRevision(postId: string, onRevised: () => void): SocialPostRevisionState {
  const { settings } = useAiSettings();
  const { result, loaded } = usePersistedResult();
  const [changes, setChanges] = useState("");
  const request = useRequest(reviseSocialPost);
  const controllerRef = useRef<AbortController | null>(null);
  const source = result?.posts.find((post) => post.id === postId) ?? null;

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function submit() {
    if (!result || !source) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const revised = await request.run(
      settings,
      {
        platform: result.platform,
        userQuery: result.userQuery,
        originalPost: source.content,
        changeRequest: changes,
      },
      controller.signal,
    );
    if (!revised || controller.signal.aborted) return;

    const latest = await loadSocialPostsResult();
    const parent = latest?.posts.find((post) => post.id === postId);
    if (!latest || !parent) return;
    const revisions = latest.posts.filter((post) => post.parentId === parent.id).length;
    const post: SocialPost = {
      id: newPostId(),
      parentId: parent.id,
      label: `${parent.label} · Revision ${revisions + 1}`,
      content: revised.content,
      designerNotes: revised.designerNotes,
    };
    await saveSocialPostsResult({ ...latest, posts: [...latest.posts, post] }).catch(() => undefined);
    onRevised();
  }

  return {
    source,
    loaded,
    changes,
    setChanges,
    pending: request.pending,
    error: request.error,
    submit,
  };
}

export function SocialPostsReviseFields({ revise }: { revise: SocialPostRevisionState }) {
  const colors = useThemeColors();
  const { source, loaded, changes, setChanges, pending } = revise;

  if (!loaded) return null;
  if (!source) {
    return <Text style={[styles.missing, { color: colors.mutedForeground }]}>This post is no longer available. Go back and choose another post.</Text>;
  }

  return (
    <>
      <Panel>
        <SectionTitle icon={Pencil} title={source.label} />
        <MarkdownText content={source.content} />
      </Panel>
      <TextField
        label="Changes you want"
        placeholder="e.g. Make it shorter and end with a question."
        value={changes}
        onChangeText={setChanges}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </>
  );
}

export function SocialPostsReviseFooter({ revise }: { revise: SocialPostRevisionState }) {
  const { source, pending, error, submit } = revise;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Creating revision…" : "Create revision"}
        icon={Sparkles}
        loading={pending}
        disabled={!source}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  missing: {
    fontSize: 14,
    lineHeight: 20,
  },
});
