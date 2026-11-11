// src/features/language-tester/components/ChallengeResult.tsx
/** Translation challenge: the task, source text, vocabulary, cultural tip, and a revealable reference answer. */
import { useState } from "react";
import { BookOpen, Eye, EyeOff, Globe, PenLine, Quote, Target } from "lucide-react-native";
import { Panel, TextField, ActionButton } from "@/components/tool/FormControls";
import { usePersistedRunState } from "@/hooks/usePersistedRunState";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { Section } from "@/components/tool/Section";
import type { ChallengeResult as ChallengeResultData } from "../types";

const ATTEMPT_KEY = "language-learner.language-tester.challenge.attempt.v1";

export function ChallengeResult({ result }: { result: ChallengeResultData }) {
  const [attempt, setAttempt] = usePersistedRunState(ATTEMPT_KEY, JSON.stringify(result), "");
  const [revealed, setRevealed] = useState(false);

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Target} title={`Test type: ${result.testType}`} />
        {result.challengeInstruction !== "" && (
          <>
            <MarkdownText content={result.challengeInstruction} />
            <ListenButton text={result.challengeInstruction} label="Challenge" />
          </>
        )}
        {result.sourceText !== "" && (
          <ResultCallout icon={Quote} title="Source text" tone="sky">
            <MarkdownText content={result.sourceText.split("\n").map((line) => `> ${line}`).join("\n")} />
            <ListenButton text={result.sourceText} label="Source text" />
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
            <ListenButton text={result.culturalTip} label="Cultural tip" />
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
          voice
        />
        <ActionButton
          label={revealed ? "Hide reference answer" : "Reveal reference answer"}
          icon={revealed ? EyeOff : Eye}
          variant="outline"
          onPress={() => setRevealed((current) => !current)}
        />
        {revealed && (
          <ResultCallout icon={Eye} title="Reference answer" tone="emerald">
            <MarkdownText content={result.correctReference} />
            <ListenButton text={result.correctReference} label="Reference answer" />
          </ResultCallout>
        )}
      </Panel>
    </Section>
  );
}
