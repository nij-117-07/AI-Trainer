// src/features/learning/tutor-chat/components/pages/TutorChatPage.tsx
/**
 * Top-level Tutor Chat view switcher. Reads the ?session=<id> query param: with
 * a session it renders the three-column chat workspace; without one it shows
 * the session picker (create new / select old). Navigation only updates the URL.
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TutorChatSessionSummary } from "../../types";
import { SessionPicker } from "../sessions/SessionPicker";
import { ChatWorkspace } from "../chat/ChatWorkspace";

interface TutorChatPageProps {
  initialSessions: TutorChatSessionSummary[];
}

export function TutorChatPage({ initialSessions }: TutorChatPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const openSession = (id: string) => {
    router.replace(`/learning/tutor-chat?session=${id}`);
  };

  const goToList = () => {
    router.replace("/learning/tutor-chat");
  };

  if (sessionId) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <ChatWorkspace
          key={sessionId}
          sessionId={sessionId}
          onBackToList={goToList}
          onNewSession={goToList}
        />
      </div>
    );
  }

  return <SessionPicker initialSessions={initialSessions} onOpen={openSession} />;
}
