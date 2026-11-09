// src/features/interview/components/SetupForm.tsx
/** Setup form for a new interview: candidate profile, target position and interview context. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Briefcase } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { CountSlider } from "@/components/tool/CountSlider";
import { MAX_QUESTIONS_LIMIT, POSITION_LEVEL_OPTIONS, QUESTION_TYPE_OPTIONS, ROUND_OPTIONS } from "../options";
import { validateSetup } from "../lib/validate";
import type { InterviewSetup, InterviewSetupForm as SetupValues, QuestionType } from "../types";

interface SetupFormProps {
  form: SetupValues;
  onChange: <K extends keyof SetupValues>(key: K, value: SetupValues[K]) => void;
  isPending: boolean;
  error: string | null;
  hasSession: boolean;
  onStart: (setup: InterviewSetup) => void;
}

export function SetupForm({ form, onChange, isPending, error, hasSession, onStart }: SetupFormProps) {
  const colors = useThemeColors();
  const [formError, setFormError] = useState<string | null>(null);

  function handleStart() {
    try {
      const setup = validateSetup(form);
      setFormError(null);
      onStart(setup);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Check the interview setup.");
    }
  }

  return (
    <Panel>
      <GroupTitle text="Candidate profile" />
      <TextField
        label="Name"
        value={form.candidateName}
        onChangeText={(text) => onChange("candidateName", text)}
        editable={!isPending}
        maxLength={200}
      />
      <TextField
        label="Experience"
        placeholder="e.g. 3 years backend, led a payments migration"
        value={form.candidateExperience}
        onChangeText={(text) => onChange("candidateExperience", text)}
        editable={!isPending}
        maxLength={1000}
        multiline
        voice
      />
      <TextField
        label="Skills"
        hint="Comma-separated"
        placeholder="Python, AWS, Kafka"
        value={form.candidateSkills}
        onChangeText={(text) => onChange("candidateSkills", text)}
        editable={!isPending}
        maxLength={1000}
      />

      <GroupTitle text="Target position" />
      <TextField
        label="Role"
        placeholder="Senior Backend Engineer"
        value={form.positionRole}
        onChangeText={(text) => onChange("positionRole", text)}
        editable={!isPending}
        maxLength={300}
      />
      <TextField
        label="Company (optional)"
        value={form.positionCompany}
        onChangeText={(text) => onChange("positionCompany", text)}
        editable={!isPending}
        maxLength={300}
      />
      <TextField
        label="Required skills"
        hint="Comma-separated"
        value={form.positionSkills}
        onChangeText={(text) => onChange("positionSkills", text)}
        editable={!isPending}
        maxLength={1000}
      />
      <SelectField
        label="Seniority level"
        options={POSITION_LEVEL_OPTIONS}
        value={form.positionLevel}
        onChange={(value) => onChange("positionLevel", value)}
        allowCustom={false}
      />

      <GroupTitle text="Interview context" />
      <TextField
        label="Interviewer role"
        placeholder="Tech Lead"
        value={form.interviewerRole}
        onChangeText={(text) => onChange("interviewerRole", text)}
        editable={!isPending}
        maxLength={300}
      />
      <SelectField
        label="Interview type"
        options={QUESTION_TYPE_OPTIONS}
        value={form.interviewType}
        onChange={(value) => onChange("interviewType", value as QuestionType)}
        allowCustom={false}
      />
      <SelectField
        label="Round"
        options={ROUND_OPTIONS}
        value={form.interviewRound}
        onChange={(value) => onChange("interviewRound", value)}
        allowCustom={false}
      />
      <TextField
        label="Format"
        placeholder="e.g. 60 min live"
        value={form.interviewFormat}
        onChangeText={(text) => onChange("interviewFormat", text)}
        editable={!isPending}
        maxLength={300}
      />
      <CountSlider
        label="Max questions"
        min={1}
        max={MAX_QUESTIONS_LIMIT}
        value={form.maxQuestions}
        onChange={(value) => onChange("maxQuestions", value)}
      />
      <TextField
        label="Duration (minutes)"
        hint="From 5 to 480"
        value={form.durationMinutes}
        onChangeText={(text) => onChange("durationMinutes", text.replace(/[^0-9]/g, ""))}
        editable={!isPending}
        keyboardType="number-pad"
        maxLength={3}
      />

      {hasSession ? (
        <View style={[styles.warning, { borderColor: colors.tone.amber.border, backgroundColor: colors.tone.amber.bg }]}>
          <Text style={[styles.warningText, { color: colors.tone.amber.fg }]}>
            Starting again will replace the active interview session.
          </Text>
        </View>
      ) : null}

      <ErrorText message={formError ?? error} />
      <ActionButton
        label={isPending ? "Deciding the first move…" : hasSession ? "Start a new interview" : "Start interview"}
        icon={Briefcase}
        loading={isPending}
        onPress={handleStart}
      />
    </Panel>
  );
}

function GroupTitle({ text }: { text: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>{text.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  groupTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  warning: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
