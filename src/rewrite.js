import { GENERATION_MODES, LANGUAGE_MODES, PROMPT_PROFILES } from "./shared/profiles.js";
import { generatePromptVariants } from "./shared/promptGenerator.js";
import {
  addHistoryEntry,
  clearHistory,
  consumePendingSourceText,
  getHistory,
  getSettings,
  saveSettings
} from "./shared/chromeStorage.js";

const elements = {
  profile: document.querySelector("#profile"),
  languageMode: document.querySelector("#languageMode"),
  generationMode: document.querySelector("#generationMode"),
  sourceText: document.querySelector("#sourceText"),
  generate: document.querySelector("#generate"),
  clear: document.querySelector("#clear"),
  results: document.querySelector("#results"),
  status: document.querySelector("#status"),
  openChatGPT: document.querySelector("#openChatGPT"),
  openCodex: document.querySelector("#openCodex"),
  openOptions: document.querySelector("#openOptions"),
  navItems: [...document.querySelectorAll(".nav-item")],
  sections: {
    compose: document.querySelector("#composeSection"),
    history: document.querySelector("#historySection"),
    about: document.querySelector("#aboutSection")
  },
  historyList: document.querySelector("#historyList"),
  clearHistory: document.querySelector("#clearHistory")
};

let settings = null;
let currentVariants = [];

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function populateProfiles() {
  elements.profile.innerHTML = PROMPT_PROFILES.map((profile) => (
    `<option value="${profile.id}">${profile.label}</option>`
  )).join("");
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  setStatus("Copied. Paste it into ChatGPT or Codex manually.");
}

function renderResults(variants) {
  elements.results.innerHTML = "";

  if (!variants.length) {
    elements.results.innerHTML = `<article class="result-card"><strong>No variants yet.</strong><p class="history-preview">Enter rough text and generate prompts.</p></article>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const variant of variants) {
    const article = document.createElement("article");
    article.className = "result-card";

    const meta = document.createElement("div");
    meta.className = "result-meta";

    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = variant.title;

    const button = document.createElement("button");
    button.className = "copy-button";
    button.type = "button";
    button.textContent = "Copy";
    button.addEventListener("click", () => copyText(variant.content));

    const content = document.createElement("pre");
    content.className = "result-content";
    content.textContent = variant.content;

    meta.append(title, button);
    article.append(meta, content);
    fragment.append(article);
  }

  elements.results.append(fragment);
}

function renderHistory(history) {
  elements.historyList.innerHTML = "";

  if (!history.length) {
    elements.historyList.innerHTML = `<article class="history-card"><strong>No history yet.</strong><p class="history-preview">Generated prompts appear here when local history is enabled.</p></article>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const entry of history) {
    const article = document.createElement("article");
    article.className = "history-card";

    const top = document.createElement("div");
    top.className = "history-top";

    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = entry.profileLabel || "Prompt";
    const time = document.createElement("p");
    time.className = "history-preview";
    time.textContent = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "";
    left.append(title, time);

    const actions = document.createElement("div");
    actions.className = "history-actions";

    const loadButton = document.createElement("button");
    loadButton.className = "small-button";
    loadButton.textContent = "Load";
    loadButton.type = "button";
    loadButton.addEventListener("click", () => {
      elements.sourceText.value = entry.sourceText || "";
      elements.profile.value = entry.profileId || settings.defaultProfileId;
      setActiveSection("compose");
      generate();
    });

    const copyButton = document.createElement("button");
    copyButton.className = "small-button";
    copyButton.textContent = "Copy first";
    copyButton.type = "button";
    copyButton.addEventListener("click", () => copyText(entry.variants?.[0]?.content || entry.sourceText || ""));

    actions.append(loadButton, copyButton);
    top.append(left, actions);

    const preview = document.createElement("p");
    preview.className = "history-preview";
    preview.textContent = entry.sourcePreview || "";

    article.append(top, preview);
    fragment.append(article);
  }

  elements.historyList.append(fragment);
}

function setActiveSection(sectionName) {
  for (const [name, section] of Object.entries(elements.sections)) {
    section.classList.toggle("active", name === sectionName);
  }
  for (const item of elements.navItems) {
    item.classList.toggle("active", item.dataset.section === sectionName);
  }
}

async function generate() {
  const sourceText = elements.sourceText.value.trim();
  if (!sourceText) {
    setStatus("Enter rough text first.", true);
    elements.sourceText.focus();
    return;
  }

  currentVariants = generatePromptVariants({
    sourceText,
    profileId: elements.profile.value,
    languageMode: elements.languageMode.value,
    generationMode: elements.generationMode.value
  });
  renderResults(currentVariants);
  setStatus(`Generated ${currentVariants.length} variants locally.`);

  if (settings.autoSaveHistory) {
    await addHistoryEntry({
      profileId: elements.profile.value,
      profileLabel: PROMPT_PROFILES.find((profile) => profile.id === elements.profile.value)?.label,
      sourceText,
      variants: currentVariants
    }, settings.historyLimit);
    renderHistory(await getHistory());
  }
}

function openUrl(url) {
  if (chrome.tabs?.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

async function init() {
  populateProfiles();
  settings = await getSettings();
  elements.profile.value = settings.defaultProfileId;
  elements.languageMode.value = settings.defaultLanguageMode ?? LANGUAGE_MODES.BOTH;
  elements.generationMode.value = settings.defaultGenerationMode ?? GENERATION_MODES.DIRECT;

  renderHistory(await getHistory());
  const pendingText = await consumePendingSourceText();
  if (pendingText) {
    elements.sourceText.value = pendingText;
    setStatus("Loaded selected text from context menu.");
    await generate();
  } else {
    renderResults([]);
    setStatus("Ready. Generate prompts locally, then paste manually.");
  }

  elements.generate.addEventListener("click", generate);
  elements.clear.addEventListener("click", () => {
    elements.sourceText.value = "";
    currentVariants = [];
    renderResults([]);
    setStatus("Cleared.");
  });

  elements.sourceText.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      generate();
    }
  });

  elements.openChatGPT.addEventListener("click", () => openUrl(settings.chatgptUrl || "https://chatgpt.com/"));
  elements.openCodex.addEventListener("click", () => openUrl(settings.codexUrl || "https://chatgpt.com/codex"));
  elements.openOptions.addEventListener("click", () => chrome.runtime.openOptionsPage());

  elements.profile.addEventListener("change", async () => {
    await saveSettings({ ...settings, defaultProfileId: elements.profile.value });
    settings = await getSettings();
  });

  elements.languageMode.addEventListener("change", async () => {
    await saveSettings({ ...settings, defaultLanguageMode: elements.languageMode.value });
    settings = await getSettings();
  });

  elements.generationMode.addEventListener("change", async () => {
    await saveSettings({ ...settings, defaultGenerationMode: elements.generationMode.value });
    settings = await getSettings();
  });

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => setActiveSection(item.dataset.section));
  });

  elements.clearHistory.addEventListener("click", async () => {
    if (!confirm("Clear local prompt history?")) return;
    await clearHistory();
    renderHistory([]);
    setStatus("History cleared.");
  });
}

init().catch((error) => {
  console.error(error);
  setStatus("Failed to initialize Prompt Bridge.", true);
});
