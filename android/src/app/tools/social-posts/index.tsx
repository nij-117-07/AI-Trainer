// src/app/tools/social-posts/index.tsx
import { useRouter } from "expo-router";
import { Megaphone, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SocialPostsResult } from "@/features/social-posts/components/SocialPostsResult";
import { usePersistedResult } from "@/features/social-posts/hooks/usePersistedDraft";
import type { SocialPost } from "@/features/social-posts/types";

export default function SocialPostsRoute() {
  const router = useRouter();
  const { result } = usePersistedResult();

  function editPost(post: SocialPost) {
    router.push({ pathname: "/tools/social-posts/edit", params: { postId: post.id } });
  }

  return (
    <ToolScreen
      title="Social Media Post Generator"
      footer={
        <ActionButton
          label="New posts"
          icon={Sparkles}
          onPress={() => router.push("/tools/social-posts/new")}
        />
      }
    >
      <Section>
        {result ? (
          <SocialPostsResult result={result} onEdit={editPost} />
        ) : (
          <EmptyHint
            icon={Megaphone}
            title="No posts yet"
            hint="Tap New posts below, describe the platform and topic, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
