// src/features/testing-portal/components/McqTab.tsx
/**
 * MCQ generator. Settings collapse once questions exist so the quiz stays on screen.
 * "Generate more" appends to the list and sends the existing questions as past questions.
 * "Reset" clears the questions, the past list, and the form.
 */
import { useState } from "react";
import { mcqDifficultyLevelOptions, mcqQuestionTypeOptions } from "../options";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { Sparkles } from "lucide-react-native";
import { useRequest } from "@/hooks/useRequest";
import { generateMcqs } from "../lib/generators";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import type { McqFormValues, McqItem } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { BatchActions } from "./BatchActions";
import { CountSlider } from "@/components/tool/CountSlider";
import { McqQuiz } from "./McqQuiz";
import { PastQuestionsPanel } from "./PastQuestionsPanel";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";

const MAX_QUESTIONS = 10;

const DEFAULTS: McqFormValues = {
  topic: "",
  questionType: "academic",
  numQuestions: 3,
  difficultyLevel: "intermediate",
  contextSetting: "",
  customInstructions: "",
  pastQuestions: "",
};

export function McqTab() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<McqFormValues>(DEFAULTS);
  const [questions, setQuestions] = useState<McqItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(true);
  const generate = useRequest(generateMcqs);

  function update<K extends keyof McqFormValues>(key: K, value: McqFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const result = await generate.run(settings, { ...form, pastQuestions: history.join("\n") });
    if (!result) return;
    setQuestions((prev) => [...prev, ...result]);
    setHistory((prev) => [...prev, ...result.map((question) => question.questionText)].slice(-PAST_QUESTIONS_LIMIT));
    setShowSettings(false);
  }

  function reset() {
    setForm(DEFAULTS);
    setQuestions([]);
    setHistory([]);
    setShowSettings(true);
  }

  const hasQuestions = questions.length > 0;
  const summary = `${form.topic.trim() || "No topic"} · ${form.questionType} · ${form.difficultyLevel} · ${form.numQuestions} per batch`;

  return (
    <Section>
      <SettingsToggle
        title="Settings"
        summary={summary}
        expanded={showSettings}
        onToggle={() => setShowSettings((value) => !value)}
      />

      {showSettings && (
        <>
          <Panel>
            <TextField
              label="Topic"
              placeholder="e.g. Python concurrency"
              value={form.topic}
              onChangeText={(text) => update("topic", text)}
              maxLength={200}
            />
            <TextField
              label="Context setting"
              placeholder="e.g. Senior Backend Engineer Interview"
              value={form.contextSetting}
              onChangeText={(text) => update("contextSetting", text)}
              maxLength={200}
            />
            <SelectField
              label="Question type"
              options={mcqQuestionTypeOptions}
              value={form.questionType}
              onChange={(value) => update("questionType", value)}
              customPlaceholder="Type your own question type"
            />
            <SelectField
              label="Difficulty"
              options={mcqDifficultyLevelOptions}
              value={form.difficultyLevel}
              onChange={(value) => update("difficultyLevel", value)}
              customPlaceholder="Type your own difficulty"
            />
            <CountSlider
              label="Number of questions"
              max={MAX_QUESTIONS}
              value={form.numQuestions}
              onChange={(value) => update("numQuestions", value)}
            />
            <TextField
              label="Custom instructions"
              placeholder="Optional"
              value={form.customInstructions}
              onChangeText={(text) => update("customInstructions", text)}
              maxLength={1000}
              multiline
              voice
            />
            {!hasQuestions && (
              <ActionButton label="Generate MCQs" icon={Sparkles} loading={generate.pending} onPress={handleGenerate} />
            )}
          </Panel>

          <PastQuestionsPanel items={history} />
        </>
      )}

      <ErrorText message={generate.error} />

      {hasQuestions && (
        <BatchActions
          count={questions.length}
          noun="question"
          pending={generate.pending}
          onGenerateMore={handleGenerate}
          onReset={reset}
        />
      )}

      {hasQuestions && <McqQuiz questions={questions} contextSetting={form.contextSetting} />}
    </Section>
  );
}
