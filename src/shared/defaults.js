import { GENERATION_MODES, LANGUAGE_MODES, PROFILE_IDS } from "./profiles.js";

export const DEFAULT_SETTINGS = Object.freeze({
  defaultProfileId: PROFILE_IDS.CODEX_TASK,
  defaultLanguageMode: LANGUAGE_MODES.BOTH,
  defaultGenerationMode: GENERATION_MODES.DIRECT,
  chatgptUrl: "https://chatgpt.com/",
  codexUrl: "https://chatgpt.com/codex",
  historyLimit: 25,
  autoSaveHistory: true,
  theme: "system"
});

export const STORAGE_KEYS = Object.freeze({
  SETTINGS: "settings",
  HISTORY: "history",
  PENDING_SOURCE_TEXT: "pendingSourceText",
  PENDING_CREATED_AT: "pendingCreatedAt"
});
