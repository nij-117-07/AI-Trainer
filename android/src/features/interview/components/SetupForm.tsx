// src/features/interview/components/SetupForm.tsx
/**
 * New interview page. Body: candidate profile, target position and interview context. Footer: the
 * error and the start button.
 */
import { StyleSheet, Text, View } from "react-native";
import { Briefcase } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { CountSlider } from "@/components/tool/CountSlider";
import { Section } from "@/components/tool/Section";
import { MAX_QUESTIONS_LIMIT, POSITION_LEVEL_OPTIONS, QUESTION_TYPE_OPTIONS, ROUND_OPTIONS } from "../options";
import type { InterviewSetupState } from "../hooks/useInterviewSetup";
import type { QuestionType } from "../types";

export function SetupFormFields({ setup }: { setup: InterviewSetupState }) {
  const colors = useThemeColors();
  const { form, updateField: onChange, hasSession } = setup;
  const busy = setup.pending !== null;

  return (
    <Section>
      <GroupTitle text="Candidate profile" />
      <TextField
        label="Name"
        placeholder="e.g. Asha"
        value={form.candidateName}
        onChangeText={(text) => onChange("candidateName", text)}
        editable={!busy}
        maxLength={200}
      />
      <TextField
        label="Experience"
        placeholder="e.g. 3 years backend, led a payments migration"
        value={form.candidateExperience}
        onChangeText={(text) => onChange("candidateExperience", text)}
        editable={!busy}
        maxLength={1000}
        multiline
        voice
      />
      <TextField
        label="Skills"
        hint="Comma-separated"
        placeholder="e.g. Python, AWS, Kafka"
        value={form.candidateSkills}
        onChangeText={(text) => onChange("candidateSkills", text)}
        editable={!busy}
        maxLength={1000}
      />

      <GroupTitle text="Target position" />
      <TextField
        label="Role"
        placeholder="e.g. Senior Backend Engineer"
        value={form.positionRole}
        onChangeText={(text) => onChange("positionRole", text)}
        editable={!busy}
        maxLength={300}
      />
      <TextField
        label="Company (optional)"
        placeholder="e.g. Acme Corp"
        value={form.positionCompany}
        onChangeText={(text) => onChange("positionCompany", text)}
        editable={!busy}
        maxLength={300}
      />
      <TextField
        label="Required skills (optional)"
        hint="Comma-separated"
        placeholder="e.g. Python, AWS, Distributed systems"
        value={form.positionSkills}
        onChangeText={(text) => onChange("positionSkills", text)}
        editable={!busy}
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
        placeholder="e.g. Tech Lead"
        value={form.interviewerRole}
        onChangeText={(text) => onChange("interviewerRole", text)}
        editable={!busy}
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
        customPlaceholder="e.g. panel with the CTO"
      />
      <TextField
        label="Format"
        placeholder="e.g. 60 min live"
        value={form.interviewFormat}
        onChangeText={(text) => onChange("interviewFormat", text)}
        editable={!busy}
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
        editable={!busy}
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
    </Section>
  );
}

export function SetupFormFooter({ setup }: { setup: InterviewSetupState }) {
  const isPending = setup.pending === "decide";
  return (
    <>
      <ErrorText message={setup.error} />
      <ActionButton
        label={isPending ? "Deciding the first move…" : setup.hasSession ? "Start a new interview" : "Start interview"}
        icon={Briefcase}
        loading={isPending}
        onPress={() => void setup.start()}
      />
    </>
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
