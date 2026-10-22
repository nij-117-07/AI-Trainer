import { Suspense } from "react";
import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ExplainerPortalPage } from "@/features/learning/explainer/components/pages/ExplainerPortalPage";

export const metadata: Metadata = {
  title: "Explainer Tools | Learning",
  description: "Seven AI-powered tools for explaining, simplifying, and mastering any topic.",
};

export default function ExplainerPage() {
  return (
    <>
      <SetPageTitle title="Explainer Tools" />
      <Suspense fallback={null}>
        <ExplainerPortalPage />
      </Suspense>
    </>
  );
}
