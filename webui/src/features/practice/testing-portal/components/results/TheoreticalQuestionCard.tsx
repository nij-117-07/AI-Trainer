// src/features/practice/testing-portal/components/results/TheoreticalQuestionCard.tsx
/**
 * A single theoretical question with an inline answer box (text and/or image,
 * graded by the Performance Grader) and an "Answer with AI" button that
 * produces an expert answer via the generate-answer API. Question and AI
 * output render as Markdown.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { evaluateTheoreticalAnswerAction } from "@/features/practice/grader/actions/evaluate";
import { GraderFeedback } from "@/features/practice/grader/components/results/GraderFeedback";
import { FileUploadField } from "@/features/tools/components/FileUploadField";
import { generateAnswerAction } from "../../actions/generateAnswer";
import { AnswerResult } from "./AnswerResult";
import type { GradingResponse } from "@/features/practice/grader/types";
import type { AnswerResponse, AnswerFormValues, TheoreticalItem } from "../../types";

interface TheoreticalQuestionCardProps {
  index: number;
  question: TheoreticalItem;
  contextSetting: string;
  difficultyLevel: string;
  expectedLevel: string;
}

export function TheoreticalQuestionCard({
  index,
  question,
  contextSetting,
  difficultyLevel,
  expectedLevel,
}: TheoreticalQuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const gradeTool = useToolRequest<{ answer: string; file: File | null }, GradingResponse>({
    run: ({ answer: text, file: image }) =>
      evaluateTheoreticalAnswerAction({
        scenario: contextSetting,
        question_asked: question.question_text,
        target_objective: question.evaluation_criteria,
        expected_level: expectedLevel,
        user_answer_text: text,
        image,
      }),
  });
  const aiTool = useToolRequest<AnswerFormValues, AnswerResponse>({
    run: generateAnswerAction,
  });

  const askAI = () =>
    aiTool.execute({
      question: question.question_text,
      context: contextSetting,
      difficulty: difficultyLevel,
      response_format: "paragraph",
      custom_instructions: "",
    });

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <MarkdownContent content={question.question_text} className="!prose-sm" />
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
                {question.focus_area}
              </span>
              <span className="text-xs text-muted-foreground">
                Great answers cover: {question.evaluation_criteria}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <label htmlFor={`theo_answer_${index}`} className="text-sm font-medium">
            Your answer
          </label>
          <Textarea
            id={`theo_answer_${index}`}
            className="min-h-20 resize-none bg-transparent"
            placeholder="Write your answer here, then grade it against the objective."
            value={answer}
            disabled={gradeTool.isPending}
            onChange={(event) => setAnswer(event.target.value)}
          />
          <FileUploadField
            label="Answer image (optional)"
            htmlFor={`theo_answer_image_${index}`}
            value={file}
            onChange={(next) => {
              setFile(next);
              if (next) setFileError(null);
            }}
            error={fileError ?? undefined}
            hint="PNG, JPG, or WEBP — a handwritten answer, diagram, or screenshot."
            disabled={gradeTool.isPending}
          />
          <Button
            type="button"
            size="sm"
            disabled={gradeTool.isPending || (!answer.trim() && !file)}
            onClick={() => {
              if (!answer.trim() && !file) {
                setFileError("Write an answer or attach an image before grading.");
                return;
              }
              setFileError(null);
              gradeTool.execute({ answer, file });
            }}
            className="gap-2"
          >
            {gradeTool.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Grading…
              </>
            ) : (
              "Grade my answer"
            )}
          </Button>
          {gradeTool.error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {gradeTool.error}
            </p>
          )}
          {gradeTool.data && <GraderFeedback result={gradeTool.data} />}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={aiTool.isPending}
            onClick={askAI}
          >
            {aiTool.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiTool.isPending ? "Generating expert answer…" : "Answer with AI"}
          </Button>
          {aiTool.error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {aiTool.error}
            </p>
          )}
          {aiTool.data && <AnswerResult result={aiTool.data} />}
        </div>
      </CardContent>
    </Card>
  );
}
