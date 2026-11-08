// src/features/language-tester/components/ChallengeResult.tsx
/** Translation challenge: the task, source text, vocabulary, cultural tip, and a revealable reference answer. */
import { useState } from "react";
import { BookOpen, Eye, EyeOff, Globe, PenLine, Quote, Target } from "lucide-react-native";
import { Panel, TextField, ActionButton } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { Section } from "@/components/tool/Section";
import type { ChallengeResult as ChallengeResultData } from "../types";

export function ChallengeResult({ result }: { result: ChallengeResultData }) {
  const [attempt, setAttempt] = useState("");
  const [revealed, setRevealed] = useState(false);

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Target} title={`Test type: ${result.testType}`} />
        {result.challengeInstruction !== "" && (
          <MarkdownText content={result.challengeInstruction} />
        )}
        {result.sourceText !== "" && (
          <ResultCallout icon={Quote} title="Source text" tone="sky">
            <MarkdownText content={result.sourceText.split("\n").map((line) => `> ${line}`).join("\n")} />
          </ResultCallout>
        )}
        {result.vocabularyHighlights.length > 0 && (
          <>
            <SectionTitle icon={BookOpen} title="Vocabulary to watch" />
            <TagList items={result.vocabularyHighlights} />
          </>
        )}
        {result.culturalTip !== "" && (
          <ResultCallout icon={Globe} title="Cultural tip" tone="amber">
            <MarkdownText content={result.culturalTip} />
          </ResultCallout>
        )}
      </Panel>

      <Panel>
        <SectionTitle icon={PenLine} title="Your attempt" />
        <TextField
          label="Your translation or explanation"
          placeholder="Write your translation or explanation here…"
          value={attempt}
          onChangeText={setAttempt}
          multiline
          maxLength={2000}
        />
        <ActionButton
          label={revealed ? "Hide reference" : "Reveal reference"}
          icon={revealed ? EyeOff : Eye}
          variant="outline"
          onPress={() => setRevealed((current) => !current)}
        />
        {revealed && (
          <ResultCallout icon={Eye} title="Reference answer" tone="emerald">
            <MarkdownText content={result.correctReference} />
          </ResultCallout>
        )}
      </Panel>
    </Section>
  );
}
