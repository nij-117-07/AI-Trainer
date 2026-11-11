// src/features/language-tester/components/RoleplayTab.tsx
/**
 * Roleplay coach. Three stages: set up the scene, talk with the partner (each line gets coaching),
 * then a summary once the goal is reached. Settings, history, and the unsent draft are kept on the device.
 */
import { useState } from "react";
import { Text } from "react-native";
import { Play, Plus } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { typeScale, useThemeColors } from "@/theme";
import { useRequest } from "@/hooks/useRequest";
import { continueRoleplay } from "../lib/generators";
import {
  LANGUAGE_TESTER_STORAGE_KEYS,
  SAVE_FAILED_MESSAGE,
  mergeSavedForm,
  normalizeChatHistory,
} from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedValue } from "../hooks/usePersistedValue";
import type { ChatTurn, RoleplaySettings } from "../types";
import { RoleplayComposer } from "./RoleplayComposer";
import { latestFeedback, RoleplaySummary } from "./RoleplaySummary";
import { RoleplayTranscript } from "./RoleplayTranscript";
import { ToolSlotFill } from "./ToolSlotFill";

const DEFAULT_SETTINGS: RoleplaySettings = {
  targetLanguage: "French",
  level: "B1",
  scenario: "Ordering food at a busy Parisian café",
  userPersona: "A hungry tourist in a hurry",
  seed: "",
};

const LEVEL_CHIPS = CEFR_LEVEL_OPTIONS.map((option) => ({ value: option.value, label: option.value }));

function restoreDraft(saved: unknown): string {
  return typeof saved === "string" ? saved : "";
}

export function RoleplayTab() {
  const colors = useThemeColors();
  const { settings: aiSettings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const [settings, setSettings, settingsSaveError] = usePersistedValue<RoleplaySettings>(
    LANGUAGE_TESTER_STORAGE_KEYS.roleplaySettings,
    DEFAULT_SETTINGS,
    (saved) => mergeSavedForm(DEFAULT_SETTINGS, saved),
  );
  const [history, setHistory, historySaveError] = usePersistedValue<ChatTurn[]>(
    LANGUAGE_TESTER_STORAGE_KEYS.roleplayHistory,
    [],
    normalizeChatHistory,
  );
  const [draft, setDraft, draftSaveError] = usePersistedValue<string>(
    LANGUAGE_TESTER_STORAGE_KEYS.roleplayDraft,
    "",
    restoreDraft,
  );
  const saveError = settingsSaveError || historySaveError || draftSaveError;
  const [started, setStarted] = useState(false);
  const request = useRequest(continueRoleplay);
  const nextSignal = useRunSignal();

  const inChat = started || history.length > 0 || draft !== "";
  const finished = latestFeedback(history)?.isGoalAchieved === true;
  const canStart = settings.scenario.trim() !== "" && settings.userPersona.trim() !== "";

  function update<K extends keyof RoleplaySettings>(key: K, value: RoleplaySettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || request.pending) return;
    setDraft("");
    await sendLine(text, history);
  }

  async function handleRetry() {
    const last = history[history.length - 1];
    if (!last || last.role !== "user" || request.pending) return;
    await sendLine(last.content, history.slice(0, -1));
  }

  async function sendLine(text: string, base: ChatTurn[]) {
    const seed = settings.seed.trim() || `roleplay_${Date.now()}`;
    if (!settings.seed.trim()) update("seed", seed);

    const turns: ChatTurn[] = [...base, { role: "user", content: text }];
    setHistory(turns);

    const reply = await request.run(
      aiSettings,
      {
        targetLanguage: activeProfile.targetLanguage,
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

  function clearConversation() {
    setHistory([]);
    setDraft("");
    request.reset();
  }

  function handleRestart() {
    setStarted(true);
    clearConversation();
  }

  function handleNewRoleplay() {
    setStarted(false);
    clearConversation();
  }

  const title = inChat && settings.userPersona.trim() !== "" ? settings.userPersona : "Roleplay Coach";

  const headerRight =
    inChat && !request.pending ? <ResetButton onPress={handleRestart} accessibilityLabel="Restart roleplay" /> : undefined;

  const footer = !inChat ? (
    <ActionButton label="Start roleplay" icon={Play} disabled={!canStart} onPress={() => setStarted(true)} />
  ) : finished ? (
    <ActionButton label="New roleplay" icon={Plus} onPress={handleNewRoleplay} />
  ) : (
    <RoleplayComposer
      value={draft}
      pending={request.pending}
      onChangeText={setDraft}
      onSend={() => void handleSend()}
    />
  );

  return (
    <ToolScreen title={title} footerSide={false}>
      <ToolSlotFill footer={footer} headerRight={headerRight} />
      {inChat ? (
        <Section>
          <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
          {settings.scenario.trim() !== "" && (
            <Text style={[typeScale.caption, { color: colors.mutedForeground }]} numberOfLines={2}>
              {settings.scenario}
            </Text>
          )}
          <RoleplayTranscript
            turns={history}
            pending={request.pending}
            error={request.error}
            onRetry={() => void handleRetry()}
          />
          {finished && <RoleplaySummary turns={history} />}
        </Section>
      ) : (
        <Section>
          <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
          <Panel>
            <ActiveLanguageNotice />
            <Field label="Level">
              <ChoiceChips
                options={LEVEL_CHIPS}
                value={settings.level}
                onChange={(value) => update("level", value)}
                disabled={request.pending}
              />
            </Field>
            <TextField
              label="Your role"
              placeholder="e.g. A hungry tourist in a hurry"
              value={settings.userPersona}
              onChangeText={(text) => update("userPersona", text)}
              editable={!request.pending}
              maxLength={500}
              voice
            />
            <TextField
              label="Situation"
              placeholder="e.g. Ordering food at a busy Parisian café"
              value={settings.scenario}
              onChangeText={(text) => update("scenario", text)}
              editable={!request.pending}
              maxLength={500}
              voice
            />
            <TextField
              label="Character (optional)"
              placeholder="Leave blank to auto-generate"
              value={settings.seed}
              onChangeText={(text) => update("seed", text)}
              editable={!request.pending}
              maxLength={200}
            />
          </Panel>
        </Section>
      )}
    </ToolScreen>
  );
}
