// src/features/interview/components/InterviewFooter.tsx
/**
 * Session page footer: the primary action of the current stage (answer box while answering), or
 * Start new interview when no stage is open.
 */
import { useRouter } from "expo-router";
import { Briefcase, Check, RotateCcw, StepForward } from "lucide-react-native";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import { ANSWER_MAX_LENGTH } from "../options";

export function InterviewFooter({ screen }: { screen: InterviewScreen }) {
  const router = useRouter();
  const { state, pending, error } = screen;
  const busy = pending !== null;
  const newInterview = (
    <ActionButton label="Start new interview" icon={Briefcase} onPress={() => router.push("/practice/interview/new")} />
  );

  if (!state || state.stage === "report") return newInterview;

  if (state.stage === "decide" && state.decision) {
    return (
      <>
        <ErrorText message={error} />
        {screen.directive.editing ? (
          <ActionButton label="Save directive" icon={Check} loading={busy} onPress={screen.directive.save} />
        ) : (
          <ActionButton label="Ask question" icon={StepForward} loading={busy} onPress={screen.proceedFromDecide} />
        )}
      </>
    );
  }

  if (state.stage === "answer" && state.currentQuestion) {
    return (
      <AnswerComposer
        label="Your answer"
        value={screen.answer.value}
        placeholder="Type your answer…"
        maxLength={ANSWER_MAX_LENGTH}
        pending={busy}
        error={error}
        submitLabel="Submit answer"
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
          <ActionButton label="Re-review answer" icon={RotateCcw} loading={busy} onPress={screen.review.reReview} />
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
