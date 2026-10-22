import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SocialPostsPage } from "@/features/tools/social-posts/components/pages/SocialPostsPage";

export const metadata: Metadata = {
  title: "Social Media Post Generator | Tools",
  description: "Generate platform-specific social posts with designer notes, matched to your brand voice.",
};

export default function SocialPostsRoutePage() {
  return (
    <>
      <SetPageTitle title="Social Media Post Generator" />
      <SocialPostsPage />
    </>
  );
}
