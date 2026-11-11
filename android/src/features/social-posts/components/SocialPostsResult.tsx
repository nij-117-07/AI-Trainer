// src/features/social-posts/components/SocialPostsResult.tsx
/**
 * Social post output as a tree: each post is followed by its revisions, indented under it. The
 * indent stops growing after three levels so deep trees stay readable on a phone.
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb, Megaphone, Pencil } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { SocialPost, SocialPostResult } from "../types";

const MAX_INDENT_DEPTH = 3;

export function SocialPostsResult({ result, onEdit }: { result: SocialPostResult; onEdit: (post: SocialPost) => void }) {
  const colors = useThemeColors();
  const ids = new Set(result.posts.map((post) => post.id));

  /** Items whose parent is missing are shown at the top level, so a damaged link never hides a post. */
  function branchOf(parentId: string | null): SocialPost[] {
    return result.posts.filter((post) =>
      parentId === null ? post.parentId === null || !ids.has(post.parentId) : post.parentId === parentId,
    );
  }

  function renderThread(post: SocialPost, depth: number): ReactNode {
    return (
      <View key={post.id} style={{ marginLeft: Math.min(depth, MAX_INDENT_DEPTH) * spacing.lg, gap: spacing.lg }}>
        <PostCard post={post} onEdit={onEdit} />
        {branchOf(post.id).map((revision) => renderThread(revision, depth + 1))}
      </View>
    );
  }

  return (
    <>
      {result.userMessage !== "" && (
        <ResultCallout icon={Lightbulb} title="Strategy" tone="sky">
          <MarkdownText content={result.userMessage} />
          <ListenButton text={result.userMessage} label="Strategy" />
        </ResultCallout>
      )}

      <SectionTitle icon={Megaphone} title="Post variants" />
      {result.posts.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No posts were returned.</Text>
      ) : (
        <CardGrid>{branchOf(null).map((post) => renderThread(post, 0))}</CardGrid>
      )}
    </>
  );
}

function PostCard({ post, onEdit }: { post: SocialPost; onEdit: (post: SocialPost) => void }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
        {post.label}
      </Text>
      <MarkdownText content={post.content} />
      <View style={styles.actions}>
        <CopyButton text={post.content} label="Copy post" />
        <ListenButton text={post.content} label="Post" />
      </View>
      {post.designerNotes !== "" && (
        <ResultCallout icon={Lightbulb} title="Designer notes" tone="emerald">
          <MarkdownText content={post.designerNotes} />
        </ResultCallout>
      )}
      <ActionButton label="Revise post" icon={Pencil} variant="outline" onPress={() => onEdit(post)} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
