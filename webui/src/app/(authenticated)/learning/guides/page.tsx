import { Suspense } from "react";
import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { GuidesPortalPage } from "@/features/learning/guides/components/pages/GuidesPortalPage";

export const metadata: Metadata = {
  title: "Learning Guides | Learning",
  description: "Five AI-powered tools for guided tasks, daily plans, project blueprints, and topic/project suggestions.",
};

export default function GuidesPage() {
  return (
    <>
      <SetPageTitle title="Learning Guides" />
      <Suspense fallback={null}>
        <GuidesPortalPage />
      </Suspense>
    </>
  );
}