// src/features/language-tester/components/RoleplayTab.tsx
/**
 * Roleplay coach: settings for the scene, then a conversation with a character. Each line you send
 * gets grammar feedback, a fluency score, and the character's next line. Settings, history, and the
 * unsent draft are kept on the device.
 */
import { Bot, Eraser, Send } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { continueRoleplay } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS, mergeSavedForm, normalizeChatHistory } from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedValue } from "../hooks/usePersistedValue";
import type { ChatTurn, RoleplaySettings } from "../types";
import { RoleplayTranscript } from "./RoleplayTranscript";

const DEFAULT_SETTINGS: RoleplaySettings = {
  targetLanguage: "French",
  level: "B1",
  scenario: "Ordering food at a busy Parisian café",
  userPersona: "A hungry tourist in a hurry",
  seed: "",
};

function restoreDraft(saved: unknown): string {
  return typeof saved === "string" ? saved : "";
}

export function RoleplayTab() {
  const { settings: aiSettings } = useAiSettings();
  const [settings, setSettings] = usePersistedValue<RoleplaySettings>(
    LANGUAGE_TESTER_STORAGE_KEYS.roleplaySettings,
    DEFAULT_SETTINGS,
    (saved) => mergeSavedForm(DEFAULT_SETTINGS, saved),
  );
  const [history, setHistory] = usePersistedValue<ChatTurn[]>(
    LANGUAGE_TESTER_STORAGE_KEYS.roleplayHistory,
    [],
    normalizeChatHistory,
  );
  const [draft, setDraft] = usePersistedValue<string>(LANGUAGE_TESTER_STORAGE_KEYS.roleplayDraft, "", restoreDraft);
  const request = useRequest(continueRoleplay);
  const nextSignal = useRunSignal();

  function update<K extends keyof RoleplaySettings>(key: K, value: RoleplaySettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || request.pending) return;

    const seed = settings.seed.trim() || `roleplay_${Date.now()}`;
    if (!settings.seed.trim()) update("seed", seed);

    const turns: ChatTurn[] = [...history, { role: "user", content: text }];
    setHistory(turns);
    setDraft("");

    const reply = await request.run(
      aiSettings,
      {
        targetLanguage: settings.targetLanguage,
        level: settings.level,
        scenario: settings.scenario,
        userPersona: settings.userPersona,
        history: turns,
        latestResponse: text,
        seed,
      },
      nextSignal(),
    );
    if (reply) {
      setHistory((current) => [
        ...current,
        {
          role: "assistant",
          content: reply.aiCharacterResponse,
          feedback: {
            linguisticCritique: reply.linguisticCritique,
            fluencyScore: reply.fluencyScore,
            suggestedStrategies: reply.suggestedStrategies,
            isGoalAchieved: reply.isGoalAchieved,
          },
        },
      ]);
    }
  }

  function handleNewConversation() {
    setHistory([]);
    setDraft("");
    request.reset();
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Target language"
          placeholder="e.g. French"
          value={settings.targetLanguage}
          onChangeText={(text) => update("targetLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <SelectField
          label="Level"
          options={CEFR_LEVEL_OPTIONS}
          value={settings.level}
          onChange={(value) => update("level", value)}
          allowCustom={false}
        />
        <TextField
          label="Scenario"
          placeholder="e.g. Ordering food at a busy Parisian café"
          value={settings.scenario}
          onChangeText={(text) => update("scenario", text)}
          editable={!request.pending}
          maxLength={500}
          voice
        />
        <TextField
          label="Your persona"
          placeholder="e.g. A hungry tourist in a hurry"
          value={settings.userPersona}
          onChangeText={(text) => update("userPersona", text)}
          editable={!request.pending}
          maxLength={500}
          voice
        />
        <TextField
          label="Seed (character)"
          placeholder="Leave blank to auto-generate"
          hint="Determines the AI character's personality; kept stable across turns."
          value={settings.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!request.pending}
          maxLength={200}
        />
      </Panel>

      <Panel>
        <SectionTitle icon={Bot} title="Conversation" />
        <ActionButton
          label="New roleplay"
          icon={Eraser}
          variant="outline"
          onPress={handleNewConversation}
        />
        <RoleplayTranscript turns={history} pending={request.pending} />
        <ErrorText message={request.error} />
        <TextField
          label="Your line"
          placeholder="Deliver your next line…"
          value={draft}
          onChangeText={setDraft}
          editable={!request.pending}
          multiline
          maxLength={2000}
          voice
        />
        <ActionButton
          label={request.pending ? "Waiting for reply…" : "Send line"}
          icon={Send}
          loading={request.pending}
          onPress={handleSend}
        />
      </Panel>
    </Section>
  );
}
