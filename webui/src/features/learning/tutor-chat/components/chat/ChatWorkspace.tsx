// src/features/learning/tutor-chat/components/chat/ChatWorkspace.tsx
/**
 * The three-column chat workspace for an open session: left settings (topic +
 * context, autosaved), center transcript + composer, right educational
 * breakdown with prev/next navigation. Stacks to a single column on mobile.
 */
"use client";

import { AlertTriangle, Loader2, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { useTutorChat } from "../../hooks/useTutorChat";
import { SettingsPanel } from "./SettingsPanel";
import { BreakdownPanel } from "./BreakdownPanel";
import { ChatTranscript } from "./ChatTranscript";
import { ChatComposer } from "./ChatComposer";

interface ChatWorkspaceProps {
  sessionId: string;
  onBackToList: () => void;
  onNewSession: () => void;
}

export function ChatWorkspace({ sessionId, onBackToList, onNewSession }: ChatWorkspaceProps) {
  const {
    session,
    isLoading,
    loadError,
    turnError,
    settingsError,
    draft,
    setDraft,
    sendTurn,
    isPending,
    settings,
    updateSettings,
    settingsStatus,
    breakdown,
    breakdownIndex,
    breakdownCount,
    goToBreakdown,
  } = useTutorChat(sessionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <EmptyResult
          icon={MessagesSquare}
          title="Session unavailable"
          description={loadError ?? "This session could not be loaded."}
        />
        <div className="text-center">
          <Button variant="outline" onClick={onBackToList}>
            Back to sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,320px)]">
      <div className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
        <SettingsPanel
          settings={{
            master_topic: settings?.master_topic ?? session.master_topic,
            additional_context: settings?.additional_context ?? session.additional_context,
          }}
          onUpdate={updateSettings}
          status={settingsStatus}
          error={settingsError}
          disabled={isPending}
          onBackToList={onBackToList}
          onNewSession={onNewSession}
        />
      </div>

      <div className="min-w-0">
        <Card>
          <CardContent className="p-0">
            <ChatTranscript messages={session.chat_history} isPending={isPending} />
            {turnError && (
              <div
                role="alert"
                className="mx-3 mb-1 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{turnError}</span>
              </div>
            )}
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={sendTurn}
              isPending={isPending}
              placeholder="Ask a question about your topic…"
            />
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <BreakdownPanel
          items={breakdown}
          index={breakdownIndex}
          count={breakdownCount}
          onNavigate={goToBreakdown}
        />
      </div>
    </div>
  );
}
