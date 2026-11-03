import { Suspense } from "react";
import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { listSessionsAction } from "@/features/learning/tutor-chat/actions/sessions";
import { TutorPortalPage } from "@/features/learning/tutor/components/pages/TutorPortalPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tutor | Learning",
  description: "Adaptive tutor explanations, prompt templates, and conversational tutor chat.",
};

export default async function TutorPage() {
  const sessions = await listSessionsAction();
  return (
    <>
      <SetPageTitle title="Tutor" />
      <Suspense fallback={null}>
        <TutorPortalPage initialSessions={sessions} />
      </Suspense>
    </>
  );
}