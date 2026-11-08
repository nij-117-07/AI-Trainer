// src/features/ai-settings/types.ts

export interface AiSettings {
  modelName: string;
  apiKey: string;
  baseUrl: string;
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
};
