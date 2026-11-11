// src/features/interview/components/InterviewView.tsx
/**
 * Session page body: the current stage with its secondary actions, or the final report. Each
 * stage's primary action is in InterviewFooter.
 */
import type { ReactNode } from "react";
import { Briefcase, RotateCcw } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import { STAGE_LABELS } from "../options";
import { AnswerStage } from "./AnswerStage";
import { DirectiveStage } from "./DirectiveStage";
import { InterviewReport } from "./InterviewReport";
import { ProgressStage } from "./ProgressStage";
import { ReviewStage } from "./ReviewStage";
import { SessionHeader } from "./SessionHeader";
import { EmptyNote, StagePanel } from "./StagePanel";

const BUSY_LABELS: Record<string, string> = {
  decide: "Asking the session manager…",
  question: "Crafting the question…",
  review: "Scoring your answer…",
  progress: "Updating your profile…",
};

export function InterviewView({ screen }: { screen: InterviewScreen }) {
  const { state, loaded, pending, reset, endInterview } = screen;
  const busy = pending !== null;

  if (!state) {
    return (
      <Section>
        {loaded ? (
          <EmptyHint
            icon={Briefcase}
            title="No interview yet"
            hint="Tap New interview to add a candidate and a role, then start."
          />
        ) : null}
      </Section>
    );
  }

  if (state.stage === "report") {
    return <InterviewReport state={state} />;
  }

  let stage: ReactNode;
  if (state.stage === "decide" && state.decision) {
    stage = (
      <DirectiveStage decision={state.decision} edit={screen.directive} pending={pending} onRedecide={screen.redecide} />
    );
  } else if (state.stage === "answer" && state.currentQuestion) {
    stage = (
      <AnswerStage
        question={state.currentQuestion}
        pending={pending}
        onEditQuestion={screen.editQuestion}
        onRegenerate={screen.regenerateQuestion}
      />
    );
  } else if (state.stage === "review" && state.latestReview && state.currentQuestion) {
    stage = (
      <ReviewStage
        review={state.latestReview}
        question={state.currentQuestion}
        edit={screen.review}
        pending={pending}
      />
    );
  } else if (state.stage === "progress") {
    stage = <ProgressStage state={state} pending={pending} onUndo={screen.undoLastProgress} />;
  } else {
    stage = (
      <StagePanel
        label={STAGE_LABELS[state.stage] ?? "Working"}
        isPending={busy}
        pendingLabel={pending ? BUSY_LABELS[pending] : undefined}
        actions={
          busy ? undefined : <ActionButton label="Start over" icon={RotateCcw} variant="outline" onPress={reset} />
        }
      >
        <EmptyNote>This stage needs data from the previous step. Start over if it does not continue.</EmptyNote>
      </StagePanel>
    );
    return <Section>{stage}</Section>;
  }

  return (
    <Section>
      <SessionHeader state={state} isPending={busy} onEnd={endInterview} />
      {stage}
    </Section>
  );
}
