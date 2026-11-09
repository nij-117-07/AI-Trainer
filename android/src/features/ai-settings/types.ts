// src/features/ai-settings/types.ts

export interface AiSettings {
  modelName: string;
  apiKey: string;
  baseUrl: string;
  transcriptionModel: string;
  transcriptionBaseUrl: string;
  transcriptionApiKey: string;
  ttsModel: string;
  ttsVoice: string;
  ttsBaseUrl: string;
  ttsApiKey: string;
}

export interface AiSettingsContextValue {
  settings: AiSettings;
  loaded: boolean;
  saveSettings: (next: AiSettings) => Promise<void>;
}

export const EMPTY_AI_SETTINGS: AiSettings = {
  modelName: "",
  apiKey: "",
  baseUrl: "",
  transcriptionModel: "",
  transcriptionBaseUrl: "",
  transcriptionApiKey: "",
  ttsModel: "",
  ttsVoice: "",
  ttsBaseUrl: "",
  ttsApiKey: "",
};
