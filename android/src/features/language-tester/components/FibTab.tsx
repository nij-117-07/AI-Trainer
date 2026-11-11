// src/features/language-tester/components/FibTab.tsx
/** Fill-in-the-blank setup: level, number of sentences, and the details the sentences are built from. */
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ChoiceChips, Field, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { CEFR_LEVEL_OPTIONS } from "../options";
import type { FibSetup } from "./FibPractice";

const LEVEL_CHOICES = CEFR_LEVEL_OPTIONS.map((option) => ({ value: option.value, label: option.value }));
const COUNT_CHOICES = Array.from({ length: 10 }, (_, index) => ({ value: index + 1, label: String(index + 1) }));

export function FibTab({ setup }: { setup: FibSetup }) {
  const { form, update, pending } = setup;

  return (
    <Section>
      <ActiveLanguageNotice />
      <Field label="Level">
        <ChoiceChips
          options={LEVEL_CHOICES}
          value={form.level}
          onChange={(value) => update("level", value)}
          disabled={pending}
        />
      </Field>
      <Field label="Sentences">
        <ChoiceChips
          options={COUNT_CHOICES}
          value={form.numQuestions}
          onChange={(value) => update("numQuestions", value)}
          disabled={pending}
        />
      </Field>
      <TextField
        label="Scenario"
        placeholder="e.g. At the pharmacy"
        value={form.scenario}
        onChangeText={(text) => update("scenario", text)}
        editable={!pending}
        maxLength={500}
        voice
      />
      <TextField
        label="About you (optional)"
        placeholder="e.g. A nurse"
        value={form.userDetails}
        onChangeText={(text) => update("userDetails", text)}
        editable={!pending}
        maxLength={500}
        voice
      />
      <TextField
        label="Variety seed (optional)"
        placeholder="e.g. 42"
        value={form.seed}
        onChangeText={(text) => update("seed", text)}
        editable={!pending}
        maxLength={200}
      />
    </Section>
  );
}
