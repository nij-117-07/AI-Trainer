// src/features/testing-portal/components/SolverTab.tsx
/**
 * Solve an MCQ. The question form collapses once an answer is shown. "Reset" clears everything.
 */
import { useState } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { RefreshCcw, Target } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { solveMcq } from "../lib/generators";
import { OPTION_KEYS, type Options, type SolverFormValues } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { SolverResultCard } from "./SolverResultCard";

const EMPTY_OPTIONS: Options = { A: "", B: "", C: "", D: "" };

const STORAGE_KEY = "practice.testing-portal.solver.form.v1";

export function SolverTab() {
  const { settings } = useAiSettings();
  const [question, setQuestion] = usePersistedState(`${STORAGE_KEY}.question`, "");
  const [context, setContext] = usePersistedState(`${STORAGE_KEY}.context`, "");
  const [options, setOptions] = usePersistedState<Options>(`${STORAGE_KEY}.options`, EMPTY_OPTIONS);
  const [showForm, setShowForm] = useState(true);
  const solve = useRequest(solveMcq);

  async function handleSolve() {
    const values: SolverFormValues = { question, context, options };
    const result = await solve.run(settings, values);
    if (result) setShowForm(false);
  }

  function reset() {
    setQuestion("");
    setContext("");
    setOptions(EMPTY_OPTIONS);
    solve.reset();
    setShowForm(true);
  }

  const summary = question.trim() ? question.trim() : "No question yet";

  return (
    <Section>
      <SettingsToggle
        title="Question"
        summary={summary}
        expanded={showForm}
        onToggle={() => setShowForm((value) => !value)}
      />

      {showForm && (
        <Panel>
          <TextField
            label="Question"
            placeholder="Paste the MCQ question"
            value={question}
            onChangeText={setQuestion}
            maxLength={2000}
            multiline
            voice
          />
          <TextField
            label="Context"
            hint="Optional, e.g. University Exam"
            value={context}
            onChangeText={setContext}
            maxLength={500}
          />
          {OPTION_KEYS.map((key) => (
            <TextField
              key={key}
              label={`Option ${key}`}
              placeholder={`Text for option ${key}`}
              value={options[key]}
              onChangeText={(text) => setOptions((prev) => ({ ...prev, [key]: text }))}
              maxLength={500}
            />
          ))}
          <ActionButton label="Solve with AI" icon={Target} loading={solve.pending} onPress={handleSolve} />
        </Panel>
      )}

      <ErrorText message={solve.error} />

      {solve.data && (
        <>
          <SolverResultCard result={solve.data} />
          <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
        </>
      )}
    </Section>
  );
}
