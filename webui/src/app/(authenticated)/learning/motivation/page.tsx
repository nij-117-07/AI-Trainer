import { Suspense } from "react";
import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { MotivationPortalPage } from "@/features/learning/motivation/components/pages/MotivationPortalPage";

export const metadata: Metadata = {
  title: "Motivation & Reflection | Learning",
  description: "Personalized motivational quotes and deep journaling prompts tuned to your emotional state.",
};

export default function MotivationPage() {
  return (
    <>
      <SetPageTitle title="Motivation & Reflection" />
      <Suspense fallback={null}>
        <MotivationPortalPage />
      </Suspense>
    </>
  );
}