import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { CreativeAssetsPage } from "@/features/tools/creative-assets/components/pages/CreativeAssetsPage";

export const metadata: Metadata = {
  title: "Creative Assets | Tools",
  description: "Generate names, hashtags, slogans, and SEO titles with explanations for each.",
};

export default function CreativeAssetsRoutePage() {
  return (
    <>
      <SetPageTitle title="Creative Assets" />
      <CreativeAssetsPage />
    </>
  );
}
