import { Suspense } from "react";
import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { listSessionsAction } from "@/features/learning/tutor-chat/actions/sessions";
import { TutorChatPage } from "@/features/learning/tutor-chat/components/pages/TutorChatPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tutor Chat | Learning",
  description: "A topic-scoped tutor chatbot that explains concepts and breaks them down each turn.",
};

export default async function TutorChatRoutePage() {
  const sessions = await listSessionsAction();

  return (
    <>
      <SetPageTitle title="Tutor Chat" />
      <Suspense fallback={null}>
        <TutorChatPage initialSessions={sessions} />
      </Suspense>
    </>
  );
}
