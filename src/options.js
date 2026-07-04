import { GENERATION_MODES, LANGUAGE_MODES, PROMPT_PROFILES } from "./shared/profiles.js";
import { DEFAULT_SETTINGS } from "./shared/defaults.js";
import { getSettings, saveSettings } from "./shared/chromeStorage.js";

const elements = {
  defaultProfileId: document.querySelector("#defaultProfileId"),
  defaultLanguageMode: document.querySelector("#defaultLanguageMode"),
  defaultGenerationMode: document.querySelector("#defaultGenerationMode"),
  chatgptUrl: document.querySelector("#chatgptUrl"),
  codexUrl: document.querySelector("#codexUrl"),
  historyLimit: document.querySelector("#historyLimit"),
  autoSaveHistory: document.querySelector("#autoSaveHistory"),
  save: document.querySelector("#save"),
  reset: document.querySelector("#reset"),
  status: document.querySelector("#status")
};

function setStatus(message) {
  elements.status.textContent = message;
}

function populateProfiles() {
  elements.defaultProfileId.innerHTML = PROMPT_PROFILES.map((profile) =>
    `<option value="${profile.id}">${profile.label}</option>`
  ).join("");
}

function applySettings(settings) {
  elements.defaultProfileId.value = settings.defaultProfileId;
  elements.defaultLanguageMode.value = settings.defaultLanguageMode ?? LANGUAGE_MODES.BOTH;
  elements.defaultGenerationMode.value = settings.defaultGenerationMode ?? GENERATION_MODES.DIRECT;
  elements.chatgptUrl.value = settings.chatgptUrl;
  elements.codexUrl.value = settings.codexUrl;
  elements.historyLimit.value = settings.historyLimit;
  elements.autoSaveHistory.checked = Boolean(settings.autoSaveHistory);
}

function readSettingsFromForm() {
  const historyLimit = Math.max(0, Math.min(200, Number(elements.historyLimit.value) || DEFAULT_SETTINGS.historyLimit));
  return {
    defaultProfileId: elements.defaultProfileId.value,
    defaultGenerationMode: elements.defaultGenerationMode.value,
    defaultLanguageMode: elements.defaultLanguageMode.value,
    chatgptUrl: elements.chatgptUrl.value.trim() || DEFAULT_SETTINGS.chatgptUrl,
    codexUrl: elements.codexUrl.value.trim() || DEFAULT_SETTINGS.codexUrl,
    historyLimit,
    autoSaveHistory: elements.autoSaveHistory.checked
  };
}

async function init() {
  populateProfiles();
  applySettings(await getSettings());

  elements.save.addEventListener("click", async () => {
    await saveSettings(readSettingsFromForm());
    setStatus("Settings saved.");
  });

  elements.reset.addEventListener("click", async () => {
    await saveSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    setStatus("Defaults restored.");
  });
}

init().catch((error) => {
  console.error(error);
  setStatus("Failed to load settings.");
});
