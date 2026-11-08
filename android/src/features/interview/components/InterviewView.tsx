// src/features/interview/components/InterviewView.tsx
/** Interview Simulator body: the setup form, then the gated interview loop, then the final report. */
import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { RotateCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { useSetupDraft } from "../hooks/useSetupDraft";
import { STAGE_LABELS } from "../options";
import { SessionHeader } from "./SessionHeader";
import { SetupForm } from "./SetupForm";
import { StagePanel } from "./StagePanel";
import { DirectiveStage } from "./DirectiveStage";
import { QuestionStage } from "./QuestionStage";
import { AnswerStage } from "./AnswerStage";
import { ReviewStage } from "./ReviewStage";
import { ProgressStage } from "./ProgressStage";
import { InterviewReport } from "./InterviewReport";

const BUSY_LABELS: Record<string, string> = {
  decide: "Asking the session manager…",
  question: "Crafting the question…",
  review: "Scoring your answer…",
  progress: "Updating your profile…",
};

export function InterviewView() {
  const colors = useThemeColors();
  const interview = useInterviewSession();
  const draft = useSetupDraft();
  const { state, pending, error } = interview;
  const isPending = pending !== null;

  function resetAll() {
    interview.reset();
    draft.reset();
  }

  let body: ReactNode;
  if (!state) {
    body = (
      <Panel>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No interview yet</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Fill in the setup to start a mock interview.
        </Text>
      </Panel>
    );
  } else if (state.stage === "report") {
    body = <InterviewReport state={state} onRestart={interview.reset} />;
  } else if (state.stage === "decide" && state.decision) {
    body = (
      <>
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <DirectiveStage
          decision={state.decision}
          isPending={pending === "decide"}
          error={error}
          onProceed={interview.proceedFromDecide}
          onEdit={interview.editDecision}
          onRedecide={interview.redecide}
        />
      </>
    );
  } else if (state.stage === "question" && state.currentQuestion) {
    body = (
      <>
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <QuestionStage
          question={state.currentQuestion}
          isPending={pending === "question"}
          error={error}
          onProceed={interview.proceedFromQuestion}
          onRegenerate={interview.regenerateQuestion}
        />
      </>
    );
  } else if (state.stage === "answer" && state.currentQuestion) {
    body = (
      <>
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <AnswerStage
          question={state.currentQuestion}
          isPending={pending === "review"}
          error={error}
          onSubmit={interview.submitAnswer}
        />
      </>
    );
  } else if (state.stage === "review" && state.latestReview) {
    body = (
      <>
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <ReviewStage
          review={state.latestReview}
          submittedAnswer={state.currentAnswer}
          isPending={pending === "review"}
          error={error}
          onProceed={interview.proceedFromReview}
          onReReview={interview.submitAnswer}
        />
      </>
    );
  } else if (state.stage === "progress") {
    body = (
      <>
        <SessionHeader state={state} isPending={isPending} onEnd={interview.endInterview} />
        <ProgressStage
          state={state}
          isPending={pending === "progress"}
          error={error}
          onProceed={interview.proceedFromProgress}
          onUndo={interview.undoLastProgress}
        />
      </>
    );
  } else {
    body = (
      <StagePanel
        step="…"
        label={STAGE_LABELS[state.stage] ?? "Working"}
        isPending={isPending}
        pendingLabel={pending ? BUSY_LABELS[pending] : undefined}
        error={isPending ? null : error}
        actions={
          isPending ? undefined : (
            <ActionButton label="Start over" icon={RotateCcw} variant="outline" onPress={resetAll} />
          )
        }
      >
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          This stage needs data from the previous step. Start over if it does not continue.
        </Text>
      </StagePanel>
    );
  }

  return (
    <Section>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Run a mock interview: the session manager plans each move, you answer, and every AI step waits for your
        Proceed or Edit before continuing.
      </Text>

      <SetupForm
        form={draft.form}
        onChange={draft.updateField}
        isPending={pending === "decide"}
        error={state ? null : error}
        hasSession={Boolean(state)}
        onStart={(setup) => void interview.start(setup)}
      />

      {body}

      <ActionButton label="Reset" icon={RotateCcw} variant="outline" onPress={resetAll} />
    </Section>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
