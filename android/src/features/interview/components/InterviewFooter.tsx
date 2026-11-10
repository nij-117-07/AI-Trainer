// src/features/interview/components/InterviewFooter.tsx
/**
 * Session page footer: the primary action of the current stage (answer box while answering), or
 * New interview when no stage is open.
 */
import { useRouter } from "expo-router";
import { Briefcase, Pencil, RotateCcw, StepForward } from "lucide-react-native";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import { ANSWER_MAX_LENGTH } from "../options";

export function InterviewFooter({ screen }: { screen: InterviewScreen }) {
  const router = useRouter();
  const { state, pending, error } = screen;
  const busy = pending !== null;
  const newInterview = (
    <ActionButton label="New interview" icon={Briefcase} onPress={() => router.push("/practice/interview/new")} />
  );

  if (!state || state.stage === "report") return newInterview;

  if (state.stage === "decide" && state.decision) {
    return (
      <>
        <ErrorText message={error} />
        {screen.directive.editing ? (
          <ActionButton label="Save edits" icon={Pencil} loading={busy} onPress={screen.directive.save} />
        ) : (
          <ActionButton label="Proceed" icon={StepForward} loading={busy} onPress={screen.proceedFromDecide} />
        )}
      </>
    );
  }

  if (state.stage === "answer" && state.currentQuestion) {
    return (
      <AnswerComposer
        label="Your response"
        value={screen.answer.value}
        placeholder="Type your answer…"
        maxLength={ANSWER_MAX_LENGTH}
        pending={busy}
        error={error}
        submitLabel="Submit"
        onChangeText={screen.answer.setValue}
        onSubmit={() => void screen.answer.submit()}
      />
    );
  }

  if (state.stage === "review" && state.latestReview) {
    return (
      <>
        <ErrorText message={error} />
        {screen.review.editing ? (
          <ActionButton label="Re-review" icon={RotateCcw} loading={busy} onPress={screen.review.reReview} />
        ) : (
          <ActionButton label="Track progress" icon={StepForward} loading={busy} onPress={screen.proceedFromReview} />
        )}
      </>
    );
  }

  if (state.stage === "progress") {
    return (
      <>
        <ErrorText message={error} />
        <ActionButton label="Next question" icon={StepForward} loading={busy} onPress={screen.proceedFromProgress} />
      </>
    );
  }

  return (
    <>
      <ErrorText message={error} />
      {newInterview}
    </>
  );
}
