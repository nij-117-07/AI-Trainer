// src/features/puzzle/components/PuzzleScreen.tsx
/**
 * Puzzle Generator: pick a topic, puzzle type, domain, and difficulty, then keep answering the
 * puzzle until it is solved. Each attempt is scored and the solution is revealed on request. The
 * form and the current round are kept on the device.
 */
import { useEffect, useRef } from "react";
import { Puzzle as PuzzleIcon, RefreshCcw } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { COGNITIVE_DOMAIN_OPTIONS, DIFFICULTY_OPTIONS, PUZZLE_TYPE_OPTIONS } from "../options";
import { evaluatePuzzleAttempt, generatePuzzle } from "../lib/generators";
import { TOPIC_MAX } from "../lib/validate";
import { usePersistedPuzzle } from "../hooks/usePersistedPuzzle";
import type { CognitiveDomain, DifficultyLevel, PuzzleFormValues, PuzzleType } from "../types";
import { PuzzleRoundView } from "./PuzzleRoundView";
import { EmptyNote } from "./ResultParts";

export function PuzzleScreen() {
  const { settings } = useAiSettings();
  const { form, setForm, round, setRound, reset } = usePersistedPuzzle();
  const generate = useRequest(generatePuzzle);
  const evaluate = useRequest(evaluatePuzzleAttempt);
  const controllerRef = useRef<AbortController | null>(null);
  const busy = generate.pending || evaluate.pending;

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof PuzzleFormValues>(key: K, value: PuzzleFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function nextSignal(): AbortSignal {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }

  async function handleGenerate() {
    const puzzle = await generate.run(settings, form, nextSignal());
    if (!puzzle) return;
    evaluate.reset();
    setRound({ puzzle, puzzleType: form.puzzleType, attempts: [], userAnswer: "" });
  }

  function handleAnswerChange(answer: string) {
    setRound((current) => (current ? { ...current, userAnswer: answer } : current));
  }

  async function handleSubmit() {
    if (!round) return;
    const answer = round.userAnswer.trim();
    if (!answer) return;
    const evaluation = await evaluate.run(
      settings,
      { puzzle: round.puzzle, puzzleType: round.puzzleType, answer },
      nextSignal(),
    );
    if (!evaluation) return;
    setRound((current) =>
      current ? { ...current, attempts: [...current.attempts, { answer, evaluation }], userAnswer: "" } : current,
    );
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    generate.reset();
    evaluate.reset();
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Field of interest"
          placeholder="e.g. Cyberpunk, Ancient Egypt, Quantum Physics"
          value={form.fieldOfInterest}
          onChangeText={(text) => update("fieldOfInterest", text)}
          editable={!busy}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Puzzle type"
          options={PUZZLE_TYPE_OPTIONS}
          value={form.puzzleType}
          onChange={(value) => update("puzzleType", value as PuzzleType)}
          allowCustom={false}
        />
        <SelectField
          label="Cognitive domain"
          options={COGNITIVE_DOMAIN_OPTIONS}
          value={form.targetDomain}
          onChange={(value) => update("targetDomain", value as CognitiveDomain)}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.difficultyLevel}
          onChange={(value) => update("difficultyLevel", value as DifficultyLevel)}
          allowCustom={false}
        />
        <ActionButton
          label={generate.pending ? "Crafting the puzzle…" : "Generate puzzle"}
          icon={PuzzleIcon}
          loading={generate.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={generate.error} />

      {round ? (
        <PuzzleRoundView
          key={round.puzzle.puzzleText}
          round={round}
          isPending={evaluate.pending}
          error={evaluate.error}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
        />
      ) : (
        <EmptyNote message="Pick a topic, puzzle type, and difficulty, then generate your first puzzle." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}
