import { DEFAULT_SETTINGS, STORAGE_KEYS } from "./defaults.js";

function hasChromeStorage() {
  return typeof chrome !== "undefined" && chrome.storage?.local;
}

export async function getSettings() {
  if (!hasChromeStorage()) return { ...DEFAULT_SETTINGS };
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] ?? {}) };
}

export async function saveSettings(settings) {
  if (!hasChromeStorage()) return;
  const next = { ...DEFAULT_SETTINGS, ...settings };
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: next });
}

export async function getHistory() {
  if (!hasChromeStorage()) return [];
  const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  return Array.isArray(result[STORAGE_KEYS.HISTORY]) ? result[STORAGE_KEYS.HISTORY] : [];
}

export async function addHistoryEntry(entry, limit = DEFAULT_SETTINGS.historyLimit) {
  if (!hasChromeStorage()) return;
  const history = await getHistory();
  const nextEntry = {
    id: entry.id ?? crypto.randomUUID(),
    createdAt: entry.createdAt ?? new Date().toISOString(),
    profileId: entry.profileId,
    profileLabel: entry.profileLabel,
    sourcePreview: String(entry.sourceText ?? "").slice(0, 180),
    sourceText: entry.sourceText ?? "",
    variants: entry.variants ?? []
  };
  const max = Math.max(0, Number(limit) || DEFAULT_SETTINGS.historyLimit);
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [nextEntry, ...history].slice(0, max) });
}

export async function clearHistory() {
  if (!hasChromeStorage()) return;
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [] });
}

export async function setPendingSourceText(sourceText) {
  if (!hasChromeStorage()) return;
  await chrome.storage.local.set({
    [STORAGE_KEYS.PENDING_SOURCE_TEXT]: String(sourceText ?? ""),
    [STORAGE_KEYS.PENDING_CREATED_AT]: new Date().toISOString()
  });
}

export async function consumePendingSourceText() {
  if (!hasChromeStorage()) return "";
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.PENDING_SOURCE_TEXT,
    STORAGE_KEYS.PENDING_CREATED_AT
  ]);
  await chrome.storage.local.remove([
    STORAGE_KEYS.PENDING_SOURCE_TEXT,
    STORAGE_KEYS.PENDING_CREATED_AT
  ]);
  return result[STORAGE_KEYS.PENDING_SOURCE_TEXT] ?? "";
}
