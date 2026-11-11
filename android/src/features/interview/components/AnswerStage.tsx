/**
 * The question and the answer step. The wording can be edited and the question regenerated here.
 * The answer box is in the footer (InterviewFooter). The grading criteria stay hidden until the review.
 */
import { RotateCcw } from "lucide-react-native";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import type { InterviewPending } from "../hooks/useInterviewSession";
import type { InterviewQuestion } from "../types";
import { BadgeRow, StageBadge, StagePanel } from "./StagePanel";

interface AnswerStageProps {
  question: InterviewQuestion;
  pending: InterviewPending;
  onEditQuestion: (text: string) => void;
  onRegenerate: () => void;
}

export function AnswerStage({ question, pending, onEditQuestion, onRegenerate }: AnswerStageProps) {
  const busy = pending !== null;
  const drafting = pending === "question" || pending === "review";

  return (
    <StagePanel
      label="Interview question"
      isPending={drafting}
      pendingLabel={pending === "question" ? "Crafting the question…" : "Reviewing your answer…"}
      actions={
        <ActionButton
          label="Regenerate question"
          icon={RotateCcw}
          variant="outline"
          disabled={busy}
          onPress={onRegenerate}
        />
      }
    >
      <BadgeRow>
        <StageBadge label={question.topic || "General"} />
        <StageBadge label={question.difficulty} />
      </BadgeRow>
      <TextField
        label="Question wording"
        value={question.question}
        onChangeText={onEditQuestion}
        editable={!busy}
        maxLength={2000}
        multiline
        voice
      />
      <ListenButton text={question.question} label="Question" />
    </StagePanel>
  );
}
