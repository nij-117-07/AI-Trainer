// src/app/tools/social-posts/index.tsx
import { SocialPostsTab } from "@/features/social-posts/components/SocialPostsTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SocialPostsRoute() {
  return (
    <ToolScreen title="Social Media Post Generator">
      <SocialPostsTab />
    </ToolScreen>
  );
}
