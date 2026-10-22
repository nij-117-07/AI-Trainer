// src/features/learning/tutor-chat/components/sessions/SessionPicker.tsx
/**
 * First screen of the Tutor Chat: create a new session or pick a saved one.
 * Seeds the list from the server-fetched summaries, then keeps it in sync as
 * sessions are created or deleted.
 */
"use client";

import { useState, useTransition } from "react";
import { MessagesSquare, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { listSessionsAction, deleteSessionAction } from "../../actions/sessions";
import type { TutorChatSessionSummary } from "../../types";
import { CreateSessionForm } from "./CreateSessionForm";
import { SessionCard } from "./SessionCard";

interface SessionPickerProps {
  initialSessions: TutorChatSessionSummary[];
  onOpen: (sessionId: string) => void;
}

export function SessionPicker({ initialSessions, onOpen }: SessionPickerProps) {
  const [sessions, setSessions] = useState<TutorChatSessionSummary[]>(initialSessions);
  const [pendingDelete, setPendingDelete] = useState<TutorChatSessionSummary | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();
  const [listError, setListError] = useState<string | null>(null);

  const handleCreated = (sessionId: string) => {
    onOpen(sessionId);
  };

  const handleRefresh = () => {
    startRefresh(async () => {
      try {
        setSessions(await listSessionsAction());
        setListError(null);
      } catch (error) {
        setListError(error instanceof Error ? error.message : "Failed to refresh sessions.");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    startDelete(async () => {
      try {
        await deleteSessionAction(pendingDelete.id);
        setSessions((current) =>
          current.filter((session) => session.id !== pendingDelete.id)
        );
      } catch (error) {
        setListError(error instanceof Error ? error.message : "Failed to delete session.");
      } finally {
        setPendingDelete(null);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tutor Chat</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A topic-scoped tutor that keeps your context and previous turns in mind,
          replying with a personalized explanation and a concept breakdown each time.
        </p>
      </header>

      <CreateSessionForm onCreated={handleCreated} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Saved sessions</h2>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {listError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {listError}
          </div>
        )}

        {sessions.length === 0 ? (
          <EmptyResult
            icon={MessagesSquare}
            title="No sessions yet"
            description="Create your first session above, then ask your first question."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onOpen={onOpen}
                onDelete={setPendingDelete}
                disabled={isDeleting || isRefreshing}
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{pendingDelete?.master_topic}&rdquo; and its entire chat history will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleConfirmDelete}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
