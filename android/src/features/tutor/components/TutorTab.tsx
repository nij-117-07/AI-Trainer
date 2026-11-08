// src/features/tutor/components/TutorTab.tsx
/**
 * Adaptive Tutor: explains a question at the student's level and learning style. Each answer is
 * kept as a version, and the last question becomes "last topic taught" for the next turn.
 */
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  History,
  Lightbulb,
  Presentation,
  RefreshCcw,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import type { TutorFormValues } from "../types";
import { DEFAULT_TUTOR_FORM, learningStyleOptions } from "../lib/options";
import { explainForStudent } from "../lib/generators";
import { advanceTurn } from "../lib/tutor-input";
import { usePromptTemplates } from "../hooks/usePromptTemplates";
import { useResponseVersions } from "../hooks/useResponseVersions";
import { useTutorDraft } from "../hooks/useTutorDraft";

export function TutorTab() {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings } = useAiSettings();
  const { form, setForm } = useTutorDraft();
  const templates = usePromptTemplates();
  const versions = useResponseVersions();
  const request = useRequest(explainForStudent);
  const [templateName, setTemplateName] = useState("");

  const { reload: reloadTemplates } = templates;
  useFocusEffect(
    useCallback(() => {
      void reloadTemplates();
    }, [reloadTemplates]),
  );

  const templateOptions = templates.templates.map((template) => ({
    value: template.name,
    label: template.source === "built-in" ? `${template.name} (built-in)` : template.name,
  }));
  const selectedTemplate = templates.templates.find((template) => template.name === templateName);

  function update<K extends keyof TutorFormValues>(key: K, value: TutorFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyTemplate(name: string) {
    setTemplateName(name);
    const template = templates.templates.find((item) => item.name === name);
    if (template) update("systemPrompt", template.content);
  }

  async function generate() {
    const submitted = form;
    const result = await request.run(settings, submitted);
    if (!result) return;
    versions.push(result);
    setForm(advanceTurn(submitted));
  }

  function reset() {
    setForm(DEFAULT_TUTOR_FORM);
    setTemplateName("");
    request.reset();
  }

  function clearHistory() {
    Alert.alert("Clear responses?", "This removes every saved version of the tutor's answers.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          versions.reset();
          request.reset();
        },
      },
    ]);
  }

  const active = versions.active;
  const total = versions.versions.length;

  return (
    <Section>
      <Panel>
        <SelectField
          label="System prompt template"
          options={templateOptions}
          value={selectedTemplate?.name ?? ""}
          onChange={applyTemplate}
          allowCustom={false}
        />
        <TextField
          label="System prompt (tutor persona)"
          placeholder="How should the tutor behave and teach?"
          hint="The persona and pedagogical rules. Pick a template above to autofill, then edit freely."
          value={form.systemPrompt}
          onChangeText={(text) => update("systemPrompt", text)}
          editable={!request.pending}
          maxLength={4000}
          multiline
        />
        <TextField
          label="Your question"
          placeholder="Ask the question you are struggling with…"
          hint="After answering, your question moves to 'Last topic taught'."
          value={form.userQuery}
          onChangeText={(text) => update("userQuery", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Student level"
          placeholder="e.g. Toddler, High School, Expert"
          value={form.studentLevel}
          onChangeText={(text) => update("studentLevel", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <SelectField
          label="Learning style"
          options={learningStyleOptions}
          value={form.learningStyle}
          onChange={(value) => update("learningStyle", value)}
          customPlaceholder="Describe your preferred learning style…"
        />
        <TextField
          label="Current scenario"
          placeholder="e.g. preparing for an exam"
          value={form.currentScenario}
          onChangeText={(text) => update("currentScenario", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <TextField
          label="Last topic taught (optional)"
          placeholder="Previous lesson context…"
          hint="Filled automatically from your previous question."
          value={form.lastTopicTaught}
          onChangeText={(text) => update("lastTopicTaught", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <ActionButton
          label={request.pending ? "Preparing your lesson…" : "Explain it to me"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => void generate()}
        />
      </Panel>

      <ErrorText message={templates.error} />
      <ErrorText message={request.error} />

      {active ? (
        <>
          <View style={[styles.versionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <History size={16} color={colors.mutedForeground} />
            <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
              Version {versions.activeIndex + 1} of {total}
            </Text>
            <View style={styles.versionActions}>
              <IconButton
                label="Previous response version"
                icon={ChevronLeft}
                disabled={versions.activeIndex <= 0}
                onPress={() => versions.goTo(versions.activeIndex - 1)}
              />
              <IconButton
                label="Next response version"
                icon={ChevronRight}
                disabled={versions.activeIndex >= total - 1}
                onPress={() => versions.goTo(versions.activeIndex + 1)}
              />
              <IconButton label="Clear response history" icon={Trash2} onPress={clearHistory} />
            </View>
          </View>

          <Panel>
            <SectionTitle icon={Presentation} title="Adapted explanation" />
            <MarkdownText content={active.adaptedExplanation} />
          </Panel>

          {active.conceptAnalogy ? (
            <ResultCallout icon={Lightbulb} title="Concept analogy" tone="amber">
              <MarkdownText content={active.conceptAnalogy} />
            </ResultCallout>
          ) : null}

          {active.tutorFeedback ? (
            <ResultCallout icon={HelpCircle} title="Your turn" tone="sky">
              <MarkdownText content={active.tutorFeedback} />
            </ResultCallout>
          ) : null}
        </>
      ) : (
        <Panel>
          <SectionTitle icon={Presentation} title="No lesson yet" />
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Ask your question and generate to see an adapted explanation, an analogy, and a follow-up question.
          </Text>
        </Panel>
      )}

      <ActionButton
        label="Manage prompt templates"
        icon={BookOpenCheck}
        variant="outline"
        onPress={() => router.push("/learning/tutor/prompts" as never)}
      />
      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

function IconButton({
  label,
  icon: Icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        { borderColor: colors.border, backgroundColor: colors.background },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={16} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  versionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  versionText: {
    flex: 1,
    fontSize: 13,
  },
  versionActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
