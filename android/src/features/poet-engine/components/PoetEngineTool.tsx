// src/features/poet-engine/components/PoetEngineTool.tsx
/** Poet Engine: explains the soul of a word in a poetic style, with etymology, verse, and a visual metaphor. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import {
  BookA,
  Eye,
  Feather,
  Languages,
  Lightbulb,
  Quote,
  RefreshCcw,
} from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import {
  ActionButton,
  ErrorText,
  Panel,
  TextField,
} from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useRequest } from "@/hooks/useRequest";
import { explainConcept } from "../lib/generators";
import { POET_ENGINE_STORAGE_KEY } from "../lib/persistence";
import { POETIC_STYLE_OPTIONS } from "../options";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { ConceptFormValues, ConceptResult } from "../types";

const DEFAULTS: ConceptFormValues = {
  targetLanguage: "Urdu",
  nativeLanguage: "English",
  conceptWord: "Ishq",
  poeticStyle: "Shayari/Couplet",
  userMood: "mystical",
  userCustomInstruction: "",
};

function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function PoetEngineTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<
    ConceptFormValues,
    ConceptResult
  >(POET_ENGINE_STORAGE_KEY, DEFAULTS);
  const request = useRequest(explainConcept);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof ConceptFormValues>(
    key: K,
    value: ConceptFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    request.reset();
  }

  async function handleExplain() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (next && !controller.signal.aborted) setResult(next);
  }

  const cancelled = controllerRef.current?.signal.aborted ?? false;

  const sections = result
    ? [
        {
          key: "etymology",
          title: "Etymological Soul",
          icon: BookA,
          tone: "amber" as const,
          body: result.etymologicalSoul,
          quoted: false,
        },
        {
          key: "poetry",
          title: "Original Poetry",
          icon: Quote,
          tone: "rose" as const,
          body: result.originalPoetry,
          quoted: true,
        },
        {
          key: "translation",
          title: "Soulful Translation",
          icon: Languages,
          tone: "sky" as const,
          body: result.soulfulTranslation,
          quoted: false,
        },
        {
          key: "reflection",
          title: "Philosophical Reflection",
          icon: Lightbulb,
          tone: "emerald" as const,
          body: result.philosophicalReflection,
          quoted: false,
        },
        {
          key: "metaphor",
          title: "Visual Metaphor",
          icon: Eye,
          tone: "sky" as const,
          body: result.visualMetaphor,
          quoted: false,
        },
      ].filter((section) => section.body !== "")
    : [];

  return (
    <Section>
      <Panel>
        <TextField
          label="Target language"
          placeholder="e.g. Urdu"
          value={form.targetLanguage}
          onChangeText={(text) => update("targetLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <TextField
          label="Native language"
          placeholder="e.g. English"
          value={form.nativeLanguage}
          onChangeText={(text) => update("nativeLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <TextField
          label="Concept word"
          placeholder="e.g. Ishq"
          hint="The word or abstract concept to explain."
          value={form.conceptWord}
          onChangeText={(text) => update("conceptWord", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <SelectField
          label="Poetic style"
          options={POETIC_STYLE_OPTIONS}
          value={form.poeticStyle}
          onChange={(value) => update("poeticStyle", value)}
          allowCustom={false}
        />
        <TextField
          label="User mood (optional)"
          placeholder="e.g. mystical, melancholic, joyful"
          hint="Emotional tone for the generation."
          value={form.userMood}
          onChangeText={(text) => update("userMood", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Custom instruction (optional)"
          placeholder="e.g. nature metaphors, urban settings…"
          hint="Specific constraints."
          value={form.userCustomInstruction}
          onChangeText={(text) => update("userCustomInstruction", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <ActionButton
          label={
            request.pending
              ? "Composing the soul of the word…"
              : "Explain the concept"
          }
          icon={Feather}
          loading={request.pending}
          onPress={handleExplain}
        />
      </Panel>

      <ErrorText message={cancelled ? null : request.error} />

      {result &&
        (sections.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No explanation was returned.
          </Text>
        ) : (
          sections.map((section) => (
            <ResultCallout
              key={section.key}
              icon={section.icon}
              title={section.title}
              tone={section.tone}
            >
              <MarkdownText
                content={section.quoted ? quote(section.body) : section.body}
              />
              <ListenButton text={section.body} label={section.title} />
            </ResultCallout>
          ))
        ))}

      <ActionButton
        label="Reset"
        icon={RefreshCcw}
        variant="outline"
        onPress={handleReset}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
