// src/features/testing-portal/components/SolverTab.tsx
import { useState } from "react";
import { Target } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "../hooks/useRequest";
import { solveMcq } from "../lib/generators";
import { OPTION_KEYS, type Options, type SolverFormValues } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "./FormControls";
import { Section } from "./Section";
import { SolverResultCard } from "./SolverResultCard";

const EMPTY_OPTIONS: Options = { A: "", B: "", C: "", D: "" };

export function SolverTab() {
  const { settings } = useAiSettings();
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState<Options>(EMPTY_OPTIONS);
  const solve = useRequest(solveMcq);

  function handleSolve() {
    const values: SolverFormValues = { question, context, options };
    return solve.run(settings, values);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Question"
          placeholder="Paste the MCQ question"
          value={question}
          onChangeText={setQuestion}
          maxLength={2000}
          multiline
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
        <ErrorText message={solve.error} />
      </Panel>

      {solve.data && <SolverResultCard result={solve.data} />}
    </Section>
  );
}
