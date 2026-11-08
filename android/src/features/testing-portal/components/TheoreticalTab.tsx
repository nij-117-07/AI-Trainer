// src/features/testing-portal/components/TheoreticalTab.tsx
/**
 * Theoretical questions. Same flow as the MCQ tab: settings collapse after the first batch,
 * "Generate more" appends, and "Reset" clears everything. Questions show one at a time by
 * default, or as a full list. Each question can be answered (text and/or image), graded by
 * AI, or answered by AI.
 */
import { useState } from "react";
import { View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { generateTheoretical } from "../lib/generators";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { theoreticalDifficultyLevelOptions, theoreticalQuestionTypeOptions } from "../options";
import type { TheoreticalFormValues, TheoreticalItem } from "../types";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { BatchActions } from "./BatchActions";
import { CountSlider } from "@/components/tool/CountSlider";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import { PastQuestionsPanel } from "./PastQuestionsPanel";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { StepNavigator } from "@/components/tool/StepNavigator";
import { TheoreticalQuestionCard } from "./TheoreticalQuestionCard";

const MAX_QUESTIONS = 5;

type ViewMode = "list" | "step";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "step", label: "One by one" },
  { value: "list", label: "List" },
];

const DEFAULTS: TheoreticalFormValues = {
  topic: "",
  questionType: "architectural",
  numQuestions: 2,
  difficultyLevel: "advanced",
  contextSetting: "",
  sourceContext: "",
  customInstructions: "",
  pastQuestions: "",
};

export function TheoreticalTab() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<TheoreticalFormValues>(DEFAULTS);
  const [questions, setQuestions] = useState<TheoreticalItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(true);
  const [mode, setMode] = useState<ViewMode>("step");
  const [activeIndex, setActiveIndex] = useState(0);
  const generate = useRequest(generateTheoretical);

  function update<K extends keyof TheoreticalFormValues>(key: K, value: TheoreticalFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const result = await generate.run(settings, { ...form, pastQuestions: history.join("\n") });
    if (!result) return;
    setQuestions((prev) => [...prev, ...result]);
    setHistory((prev) => [...prev, ...result.map((item) => item.questionText)].slice(-PAST_QUESTIONS_LIMIT));
    setShowSettings(false);
  }

  function reset() {
    setForm(DEFAULTS);
    setQuestions([]);
    setHistory([]);
    setActiveIndex(0);
    setShowSettings(true);
  }

  const hasQuestions = questions.length > 0;
  const isStep = mode === "step";
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
              placeholder="e.g. Microservices"
              value={form.topic}
              onChangeText={(text) => update("topic", text)}
              maxLength={200}
            />
            <TextField
              label="Context setting"
              placeholder="e.g. High-Tech Enterprise Interview"
              value={form.contextSetting}
              onChangeText={(text) => update("contextSetting", text)}
              maxLength={200}
            />
            <SelectField
              label="Question type"
              options={theoreticalQuestionTypeOptions}
              value={form.questionType}
              onChange={(value) => update("questionType", value)}
              customPlaceholder="Type your own question type"
            />
            <SelectField
              label="Difficulty"
              options={theoreticalDifficultyLevelOptions}
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
              label="Source context"
              hint="Optional text or data the questions should be based on."
              value={form.sourceContext}
              onChangeText={(text) => update("sourceContext", text)}
              maxLength={5000}
              multiline
            />
            <TextField
              label="Custom instructions"
              placeholder="Optional"
              value={form.customInstructions}
              onChangeText={(text) => update("customInstructions", text)}
              maxLength={1000}
              multiline
            />
            {!hasQuestions && (
              <ActionButton label="Generate questions" icon={Sparkles} loading={generate.pending} onPress={handleGenerate} />
            )}
          </Panel>

          <PastQuestionsPanel items={history} />
        </>
      )}

      <ErrorText message={generate.error} />

      {hasQuestions && (
        <>
          <BatchActions
            count={questions.length}
            noun="question"
            pending={generate.pending}
            onGenerateMore={handleGenerate}
            onReset={reset}
          />
          <Panel>
            <ChoiceChips options={VIEW_MODES} value={mode} onChange={setMode} wrap={false} />
          </Panel>
        </>
      )}

      {hasQuestions && isStep && (
        <StepNavigator
          index={activeIndex}
          total={questions.length}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(questions.length - 1, index + 1))}
        />
      )}

      {questions.map((item, index) => (
        <View key={index} style={{ display: !isStep || index === activeIndex ? "flex" : "none" }}>
          <ErrorBoundary label={`Question ${index + 1}`}>
            <TheoreticalQuestionCard
              index={index}
              question={item}
              contextSetting={form.contextSetting}
              difficultyLevel={form.difficultyLevel}
            />
          </ErrorBoundary>
        </View>
      ))}
    </Section>
  );
}
