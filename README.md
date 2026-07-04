# Manual Prompt Bridge

Manual Prompt Bridge is a local-only Chrome Extension side panel for turning rough text into ready-to-use Russian and English prompts for ChatGPT, Codex, and other coding agents.

It does not use an API key, backend, host permissions, cookies, or automatic ChatGPT submission. It generates prompt text locally, copies it after your click, and opens ChatGPT/Codex in normal browser tabs.

## Features

- Chrome Manifest V3 side panel UI.
- Toolbar click opens the side panel.
- Context menu rewrites selected text as prompt input.
- Russian, English, or bilingual prompt variants.
- Profiles for Codex tasks, coding agents, UI/UX, Chrome extensions, architecture review, security review, and product rebuilds.
- Local settings and optional local history through `chrome.storage.local`.

## Install Locally

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this project folder.
5. Click the extension icon to open the side panel.

## Development

Run the smoke check:

```bash
npm test
```

The check validates the manifest, required extension files, Side Panel configuration, lack of host permissions, and JavaScript syntax.

## CI

GitHub Actions runs `npm test` on every push and pull request.

## Privacy Model

- No `host_permissions`.
- No `cookies` permission.
- No network requests to OpenAI, ChatGPT, Codex, or any backend.
- Clipboard writes happen only after a user click.
- History is stored only in local Chrome extension storage when enabled.

## License

MIT
