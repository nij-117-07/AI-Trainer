// src/app/tools/social-posts/edit.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  SocialPostsReviseFields,
  SocialPostsReviseFooter,
  useSocialPostRevision,
} from "@/features/social-posts/components/SocialPostsRevise";

export default function SocialPostsEditRoute() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const revise = useSocialPostRevision(postId, () => router.back());

  return (
    <ToolScreen title="Revise post" footer={<SocialPostsReviseFooter revise={revise} />}>
      <SocialPostsReviseFields revise={revise} />
    </ToolScreen>
  );
}
