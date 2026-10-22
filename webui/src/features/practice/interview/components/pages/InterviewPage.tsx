// src/features/practice/interview/components/pages/InterviewPage.tsx
/**
 * Interview Simulator page: setup form first, then the gated loop
 * (decide → question → answer → review → progress) and finally the report.
 * Every AI step waits for an explicit Proceed / Edit / Regenerate.
 */
"use client";

import { Briefcase } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { useInterviewSession } from "../../hooks/useInterviewSession";
import { stageLabels } from "../../lib/options";
import { useSetupDraft } from "../../lib/setup-form";
import { SetupForm } from "../setup/SetupForm";
import { SessionHeader } from "../session/SessionHeader";
import { DirectiveStage } from "../session/DirectiveStage";
import { QuestionStage } from "../session/QuestionStage";
import { AnswerStage } from "../session/AnswerStage";
import { ReviewStage } from "../session/ReviewStage";
import { ProgressStage } from "../session/ProgressStage";
import { StageShell } from "../session/StageShell";
import { InterviewReport } from "../results/InterviewReport";

export function InterviewPage() {
  const interview = useInterviewSession();
  const draft = useSetupDraft();
  const { state, isPending, pending, error } = interview;

  const handleResetAll = () => {
    interview.reset();
    draft.clearDraft();
  };

  const stageHint = state ? stageLabels[state.stage] : null;
  const busyLabel =
    pending === "decide"
      ? "Asking the session manager…"
      : pending === "question"
        ? "Crafting the question…"
        : pending === "review"
          ? "Scoring your answer…"
          : pending === "progress"
            ? "Updating your profile…"
            : undefined;

  let result: React.ReactNode;
  if (!state) {
    result = <EmptyResult icon={Briefcase} title="No interview yet" description="Fill in the setup to start a mock interview." />;
  } else if (state.stage === "report") {
    result = <InterviewReport state={state} onRestart={interview.reset} />;
  } else if (state.stage === "decide" && state.decision) {
    result = (
      <div className="space-y-4">
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <DirectiveStage
          decision={state.decision}
          isPending={pending === "decide"}
          error={error}
          onProceed={interview.proceedFromDecide}
          onEdit={interview.editDecision}
          onRedecide={interview.redecide}
        />
      </div>
    );
  } else if (state.stage === "question" && state.current_question) {
    result = (
      <div className="space-y-4">
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <QuestionStage
          question={state.current_question}
          isPending={pending === "question"}
          error={error}
          onProceed={interview.proceedFromQuestion}
          onRegenerate={interview.regenerateQuestion}
        />
      </div>
    );
  } else if (state.stage === "answer" && state.current_question) {
    result = (
      <div className="space-y-4">
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <AnswerStage
          question={state.current_question}
          isPending={pending === "review"}
          error={error}
          onSubmit={interview.submitAnswer}
        />
      </div>
    );
  } else if (state.stage === "review" && state.latest_review) {
    result = (
      <div className="space-y-4">
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <ReviewStage
          review={state.latest_review}
          submittedAnswer={state.current_answer}
          isPending={pending === "review"}
          error={error}
          onProceed={interview.proceedFromReview}
          onReReview={interview.submitAnswer}
        />
      </div>
    );
  } else if (state.stage === "progress") {
    result = (
      <div className="space-y-4">
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <ProgressStage
          state={state}
          isPending={pending === "progress"}
          error={error}
          onProceed={interview.proceedFromProgress}
          onUndo={interview.undoProgress}
        />
      </div>
    );
  } else {
    result = (
      <div className="space-y-4">
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <StageShell
          step="…"
          label={stageHint ?? "Working"}
          isPending={isPending}
          pendingLabel={busyLabel}
          error={isPending ? null : error}
          actions={
            !isPending ? (
              <button
              type="button"
                onClick={handleResetAll}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Start over
              </button>
            ) : undefined
          }
        >
          <p className="text-sm text-muted-foreground">
            This stage needs data from the previous step. Start over if it does not continue.
          </p>
        </StageShell>
      </div>
    );
  }

  return (
    <ExplainerPageShell
      title="Interview Simulator"
      description="Run a DSPy-powered mock interview: the session manager plans each move, you answer, and every AI step waits for your Proceed / Edit before continuing."
      headerAction={
        <DraftStatus
          status={draft.status}
          onReset={() => {
            interview.reset();
            draft.resetDraft();
          }}
          onClear={handleResetAll}
          disabled={isPending}
        />
      }
      form={
        <SetupForm
          persisted={draft}
          isPending={pending === "decide"}
          error={state ? null : error}
          hasSession={Boolean(state)}
          onStart={(values) => void interview.start(values)}
        />
      }
      result={result}
    />
  );
}
