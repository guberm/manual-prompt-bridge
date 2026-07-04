import { setPendingSourceText } from "./shared/chromeStorage.js";

const MENU_REWRITE_SELECTION = "rewrite-selection-as-prompt";
const MENU_OPEN_WORKSPACE = "open-prompt-bridge-workspace";

function getWorkspaceUrl() {
  return chrome.runtime.getURL("src/rewrite.html");
}

async function getCurrentWindowId() {
  const currentWindow = await chrome.windows.getCurrent();
  return currentWindow.id;
}

async function openWorkspace(sourceText = "", windowId) {
  const trimmed = sourceText.trim();
  if (trimmed) {
    await setPendingSourceText(trimmed);
  }

  if (chrome.sidePanel?.open) {
    try {
      await chrome.sidePanel.open({ windowId: windowId ?? await getCurrentWindowId() });
      return;
    } catch (error) {
      console.warn("Falling back to a normal extension tab:", error);
    }
  }

  await chrome.tabs.create({ url: getWorkspaceUrl() });
}

async function setSidePanelBehavior() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

setSidePanelBehavior().catch(console.error);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_REWRITE_SELECTION,
      title: "Rewrite selected text as prompt",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: MENU_OPEN_WORKSPACE,
      title: "Open Prompt Bridge side panel",
      contexts: ["action"]
    });
  });

  setSidePanelBehavior().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  setSidePanelBehavior().catch(console.error);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_REWRITE_SELECTION) {
    openWorkspace(info.selectionText ?? "", tab?.windowId).catch(console.error);
  }

  if (info.menuItemId === MENU_OPEN_WORKSPACE) {
    openWorkspace("", tab?.windowId).catch(console.error);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-prompt-bridge") {
    openWorkspace("").catch(console.error);
  }
});
