// src/app/tools/social-posts/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  SocialPostsFormFields,
  SocialPostsFormFooter,
  useSocialPostsForm,
} from "@/features/social-posts/components/SocialPostsForm";

export default function SocialPostsNewRoute() {
  const router = useRouter();
  const posts = useSocialPostsForm(() => router.back());

  return (
    <ToolScreen
      title="New posts"
      headerRight={<ResetButton onPress={posts.reset} />}
      footer={<SocialPostsFormFooter posts={posts} />}
    >
      <SocialPostsFormFields posts={posts} />
    </ToolScreen>
  );
}
