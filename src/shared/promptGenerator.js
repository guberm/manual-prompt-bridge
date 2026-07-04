import { GENERATION_MODES, LANGUAGE_MODES, PROFILE_IDS, getProfile } from "./profiles.js";

const DEFAULT_SOURCE_PLACEHOLDER_RU = "ВСТАВЬ СЮДА ИСХОДНЫЙ ТЕКСТ";
const DEFAULT_SOURCE_PLACEHOLDER_EN = "PASTE THE ORIGINAL TEXT HERE";

function normalizeSourceText(sourceText) {
  const value = String(sourceText ?? "").trim();
  return value.length > 0 ? value : "";
}

function quotedBlock(text, fallback) {
  const value = text || fallback;
  return `"""\n${value}\n"""`;
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function sourceRu(sourceText) {
  return `\n\n## Исходный запрос\n\n${quotedBlock(sourceText, DEFAULT_SOURCE_PLACEHOLDER_RU)}`;
}

function sourceEn(sourceText) {
  return `\n\n## Original request\n\n${quotedBlock(sourceText, DEFAULT_SOURCE_PLACEHOLDER_EN)}`;
}

function commonRewriteRuHeader(profile) {
  return `Ты — ${profile.roleRu}.\n\nНе выполняй задачу из текста ниже. Твоя задача — только переписать, улучшить и структурировать prompt.`;
}

function commonRewriteEnHeader(profile) {
  return `You are a ${profile.roleEn}.\n\nDo not execute the task described below. Your task is only to rewrite, improve and structure the prompt.`;
}

function commonDirectRuHeader(profile) {
  return `Ты — ${profile.roleRu}.\n\nТвоя задача — выполнить запрос пользователя ниже как полноценную инженерную задачу, а не отвечать общими словами.`;
}

function commonDirectEnHeader(profile) {
  return `You are a ${profile.roleEn}.\n\nYour task is to execute the user's request below as a complete engineering task, not to respond with vague advice.`;
}

function buildAutonomyRu() {
  return `
## Режим работы

Работай самостоятельно и доводи задачу до завершения.

Не задавай уточняющие вопросы, если можно сделать разумное инженерное предположение. Если информации не хватает, выбери наиболее практичный production-ready вариант, зафиксируй предположение в документации или финальном отчете и продолжай.

Останавливайся только при настоящем blocker:

- нужны credentials или доступ к внешнему сервису;
- нужно выполнить платное действие;
- нужно удалить данные, repository, branch, release, database или cloud resource;
- нужно принять юридически значимое решение;
- без действия пользователя технически невозможно продолжить.

Перед любым destructive action сначала перечисли, что будет затронуто, предложи backup и получи explicit confirmation.`;
}

function buildAutonomyEn() {
  return `
## Working Mode

Work autonomously and drive the task to completion.

Do not ask clarifying questions when a reasonable engineering assumption is possible. If information is missing, choose the most practical production-ready option, document the assumption in the repo or final report, and continue.

Stop only for true blockers:

- credentials or external service access is required;
- a paid action is required;
- data, repositories, branches, releases, databases, or cloud resources must be deleted;
- a legal decision is required;
- it is technically impossible to continue without user action.

Before any destructive action, list what will be affected, propose a backup, and get explicit confirmation.`;
}

function buildQualityRu() {
  return `
## Качество реализации

Результат должен быть:

- production-ready;
- maintainable;
- testable;
- secure by default;
- хорошо структурированным;
- с понятной архитектурой;
- с нормальной обработкой ошибок;
- с документацией;
- без hardcoded secrets;
- без placeholder-функциональности в core flows.

Не делай временные костыли, если можно сразу сделать нормальную основу.`;
}

function buildQualityEn() {
  return `
## Quality Bar

The result must be:

- production-ready;
- maintainable;
- testable;
- secure by default;
- well structured;
- architecturally clear;
- with proper error handling;
- documented;
- without hardcoded secrets;
- without placeholder behavior in core flows.

Do not add temporary hacks when a solid foundation is practical.`;
}

function buildTestLoopRu() {
  return `
## Build/Test/Fix Loop

После изменений запусти доступные проверки:

- build;
- unit tests;
- integration tests, если есть;
- lint/type checks, если есть;
- smoke test ключевых сценариев.

Если проверки падают:

1. Проанализируй причину.
2. Исправь код.
3. Запусти проверки снова.
4. Повторяй до успешного результата или реального внешнего blocker.`;
}

function buildTestLoopEn() {
  return `
## Build/Test/Fix Loop

After making changes, run the available checks:

- build;
- unit tests;
- integration tests when available;
- lint/type checks when available;
- smoke tests for key flows.

If checks fail:

1. Analyze the cause.
2. Fix the code.
3. Run checks again.
4. Repeat until successful or blocked by a real external dependency.`;
}

function buildFinalRu() {
  return `
## Финальный результат

В конце дай короткий отчет:

- что сделано;
- какие файлы изменены или созданы;
- какие команды запускались;
- какие тесты прошли;
- что не удалось проверить;
- известные ограничения;
- следующие практичные шаги.`;
}

function buildFinalEn() {
  return `
## Final Result

At the end, provide a concise report:

- what was done;
- which files were changed or created;
- which commands were run;
- which tests passed;
- what could not be verified;
- known limitations;
- next practical steps.`;
}

function directGeneralRewriteRu(sourceText) {
  return `Ты — expert prompt engineer.

Не выполняй задачу из текста ниже. Перепиши его в сильный, профессиональный prompt, который можно сразу дать ChatGPT, Codex, Cursor, Claude Code или другому coding/productivity agent.

## Что нужно сделать

Сохрани исходный смысл, цель и ограничения, но приведи текст в нормальный рабочий вид:

- убери эмоциональные, грубые и расплывчатые формулировки;
- замени их на четкие требования;
- добавь понятный scope;
- добавь ограничения;
- добавь порядок работы;
- добавь deliverables;
- добавь acceptance criteria;
- добавь формат финального результата;
- если задача техническая, добавь требования к архитектуре, тестированию и документации;
- если задача требует автономной работы, добавь правила самостоятельного выполнения и blocker rules.

## Важные правила

- Не добавляй лишний функционал, если он явно не следует из исходного текста.
- Не удаляй важные требования.
- Если есть неоднозначность, сделай разумное предположение и включи его в prompt.
- Верни только улучшенный prompt в Markdown, без объяснения изменений.${sourceRu(sourceText)}`;
}

function directGeneralRewriteEn(sourceText) {
  return `You are an expert prompt engineer.

Do not execute the task below. Rewrite it into a strong, professional prompt that can be given directly to ChatGPT, Codex, Cursor, Claude Code, or another coding/productivity agent.

## What to do

Preserve the original intent, goal, and constraints, but turn the text into a proper working prompt:

- remove emotional, rough, or vague wording;
- replace it with clear requirements;
- add a clear scope;
- add constraints;
- add a work sequence;
- add deliverables;
- add acceptance criteria;
- add the final response format;
- if the task is technical, add architecture, testing, and documentation requirements;
- if the task requires autonomous work, add autonomous execution rules and blocker rules.

## Rules

- Do not add unrelated functionality unless it clearly follows from the source text.
- Do not remove important requirements.
- If something is ambiguous, make a reasonable assumption and include it in the prompt.
- Return only the improved prompt in Markdown, with no explanation of your changes.${sourceEn(sourceText)}`;
}

function directCodexTaskRu(sourceText, detail = "detailed") {
  const extra = detail === "strict" ? buildAutonomyRu() : "";
  return `Ты работаешь в Codex как автономный coding agent.

## Цель

Разбери запрос пользователя, преврати его в конкретную инженерную задачу, реализуй решение в репозитории и доведи его до проверяемого результата.${sourceRu(sourceText)}

## Что нужно сделать

1. Быстро изучи текущий repository/workspace.
2. Найди релевантные файлы, entry points, конфиги, tests и build scripts.
3. Сформулируй рабочий plan внутри себя и переходи к реализации.
4. Внеси необходимые изменения в код.
5. Добавь или обнови тесты.
6. Запусти доступные проверки.
7. Исправь ошибки, если проверки падают.
8. Обнови README/docs, если это нужно для использования результата.${extra}
${buildQualityRu()}
${buildTestLoopRu()}
${buildFinalRu()}`;
}

function directCodexTaskEn(sourceText, detail = "detailed") {
  const extra = detail === "strict" ? buildAutonomyEn() : "";
  return `You are working in Codex as an autonomous coding agent.

## Goal

Analyze the user's request, turn it into a concrete engineering task, implement the solution in the repository, and drive it to a verifiable result.${sourceEn(sourceText)}

## What to do

1. Quickly inspect the current repository/workspace.
2. Find the relevant files, entry points, config files, tests, and build scripts.
3. Form an internal working plan and move directly into implementation.
4. Make the necessary code changes.
5. Add or update tests.
6. Run the available checks.
7. Fix failures if checks fail.
8. Update README/docs when needed for using the result.${extra}
${buildQualityEn()}
${buildTestLoopEn()}
${buildFinalEn()}`;
}

function directCodingAgentRu(sourceText, detail = "detailed") {
  const sections = detail === "short" ? "" : `
## Технический подход

Перед реализацией восстанови requirements из запроса и зафиксируй разумные предположения. Затем выбери простую, надежную архитектуру и реализуй решение без лишней сложности.

## Deliverables

- рабочий код;
- структура проекта или измененные файлы;
- тесты для ключевой логики;
- документация по запуску;
- список проверок, которые были выполнены;
- known limitations, если они есть.`;

  return `${commonDirectRuHeader(getProfile(PROFILE_IDS.CODING_AGENT))}${sourceRu(sourceText)}

## Основная задача

Преобразуй этот запрос в конкретную реализацию. Не ограничивайся советами или планом, если можно писать код. Сделай решение понятным, аккуратным и проверяемым.${sections}
${buildQualityRu()}
${buildTestLoopRu()}
${buildFinalRu()}`;
}

function directCodingAgentEn(sourceText, detail = "detailed") {
  const sections = detail === "short" ? "" : `
## Technical Approach

Before implementation, recover requirements from the request and document reasonable assumptions. Then choose a simple, reliable architecture and implement the solution without unnecessary complexity.

## Deliverables

- working code;
- project structure or changed files;
- tests for key logic;
- run instructions;
- list of checks performed;
- known limitations, if any.`;

  return `${commonDirectEnHeader(getProfile(PROFILE_IDS.CODING_AGENT))}${sourceEn(sourceText)}

## Main Task

Turn this request into a concrete implementation. Do not stop at advice or a plan when code can be written. Make the solution clear, clean, and verifiable.${sections}
${buildQualityEn()}
${buildTestLoopEn()}
${buildFinalEn()}`;
}

function directAutonomousRu(sourceText) {
  return `${commonDirectRuHeader(getProfile(PROFILE_IDS.AUTONOMOUS_CODING_AGENT))}${sourceRu(sourceText)}
${buildAutonomyRu()}

## Выполнение

1. Восстанови требования.
2. Прими недостающие технические решения самостоятельно.
3. Спроектируй минимально достаточную архитектуру.
4. Реализуй решение.
5. Добавь тесты и документацию.
6. Запускай build/test/fix loop до стабильного результата.
7. В конце сообщи только итоговый результат.
${buildQualityRu()}
${buildTestLoopRu()}
${buildFinalRu()}`;
}

function directAutonomousEn(sourceText) {
  return `${commonDirectEnHeader(getProfile(PROFILE_IDS.AUTONOMOUS_CODING_AGENT))}${sourceEn(sourceText)}
${buildAutonomyEn()}

## Execution

1. Recover the requirements.
2. Make missing technical decisions yourself.
3. Design the minimum sufficient architecture.
4. Implement the solution.
5. Add tests and documentation.
6. Run a build/test/fix loop until stable.
7. At the end, report only the final result.
${buildQualityEn()}
${buildTestLoopEn()}
${buildFinalEn()}`;
}

function directProductRebuildRu(sourceText, detail = "detailed") {
  const strict = detail === "strict" ? buildAutonomyRu() : "";
  return `Ты — senior product engineer, software architect, security engineer, full-stack developer, UI/UX designer, QA engineer и release engineer.

## Главная цель

Полностью пересоздай продукт с нуля как production-ready software product. Старый код не рефакторить и не использовать как основу. Его можно использовать только как read-only reference для восстановления требований, user flows, доменной логики и known issues.${sourceRu(sourceText)}

## Scope

Определи из запроса, какие платформы и компоненты входят в работу. Если scope не указан явно, предложи разумный MVP scope и зафиксируй assumptions.

## Work Plan

1. Audit / requirements recovery.
2. Technical research and architecture.
3. Data model and API/contracts.
4. Implementation from scratch.
5. Premium UI where applicable.
6. Tests and hardening.
7. Documentation.
8. CI/CD and release preparation.

## Не делать

- не копировать старую плохую архитектуру;
- не делать placeholder UI;
- не оставлять core flows незавершенными;
- не удалять старые repositories/files без explicit confirmation;
- не останавливаться после плана, если можно продолжать реализацию.${strict}
${buildQualityRu()}
${buildTestLoopRu()}

## Acceptance Criteria

- новый clean codebase;
- понятная архитектура;
- рабочие core flows;
- тесты;
- документация;
- инструкции запуска;
- release-ready структура;
- known limitations зафиксированы.
${buildFinalRu()}`;
}

function directProductRebuildEn(sourceText, detail = "detailed") {
  const strict = detail === "strict" ? buildAutonomyEn() : "";
  return `You are a senior product engineer, software architect, security engineer, full-stack developer, UI/UX designer, QA engineer, and release engineer.

## Main Goal

Rebuild the product from scratch as a production-ready software product. Do not refactor the old code or use it as the foundation. Use it only as read-only reference for recovering requirements, user flows, domain logic, and known issues.${sourceEn(sourceText)}

## Scope

Infer from the request which platforms and components are in scope. If the scope is not explicit, propose a practical MVP scope and document assumptions.

## Work Plan

1. Audit / requirements recovery.
2. Technical research and architecture.
3. Data model and API/contracts.
4. Implementation from scratch.
5. Premium UI where applicable.
6. Tests and hardening.
7. Documentation.
8. CI/CD and release preparation.

## Do Not

- do not copy the old broken architecture;
- do not deliver placeholder UI;
- do not leave core flows unfinished;
- do not delete old repositories/files without explicit confirmation;
- do not stop at planning when implementation can continue.${strict}
${buildQualityEn()}
${buildTestLoopEn()}

## Acceptance Criteria

- new clean codebase;
- clear architecture;
- working core flows;
- tests;
- documentation;
- run instructions;
- release-ready structure;
- known limitations documented.
${buildFinalEn()}`;
}

function directPremiumUiRu(sourceText, detail = "detailed") {
  return `Ты — senior UI/UX designer, design systems architect и frontend/mobile engineer.

## Цель

Создай premium, production-ready UI/UX, а не prototype-quality screens или developer-looking forms.${sourceRu(sourceText)}

## Дизайн-принципы

- clarity over decoration;
- clean visual hierarchy;
- predictable navigation;
- platform best practices;
- accessibility by default;
- light/dark themes;
- responsive layouts;
- helpful empty/error/loading/offline states;
- no copied competitor UI, assets, wording or branding.

## Что нужно сделать

1. Определи ключевые user flows.
2. Спроектируй design system: typography, spacing, colors, semantic states, buttons, inputs, dialogs, toasts, cards/lists.
3. Создай polished UI для core screens.
4. Добавь real states: loading, empty, error, offline, success.
5. Продумай UX для dangerous/security-sensitive actions.
6. Реализуй UI в выбранном stack или подготовь precise implementation spec, если кодовая база пока не создана.
7. Добавь accessibility checklist и UI smoke tests where practical.

## Acceptance Criteria

- интерфейс выглядит как серьезный commercial product;
- нет placeholder screens;
- навигация понятная;
- формы аккуратные;
- ошибки полезные;
- accessibility basics выполнены;
- дизайн оригинальный и consistent.`;
}

function directPremiumUiEn(sourceText, detail = "detailed") {
  return `You are a senior UI/UX designer, design systems architect, and frontend/mobile engineer.

## Goal

Create premium, production-ready UI/UX, not prototype-quality screens or developer-looking forms.${sourceEn(sourceText)}

## Design Principles

- clarity over decoration;
- clean visual hierarchy;
- predictable navigation;
- platform best practices;
- accessibility by default;
- light/dark themes;
- responsive layouts;
- helpful empty/error/loading/offline states;
- no copied competitor UI, assets, wording, or branding.

## What to do

1. Identify the key user flows.
2. Design a system: typography, spacing, colors, semantic states, buttons, inputs, dialogs, toasts, cards/lists.
3. Create polished UI for the core screens.
4. Add real states: loading, empty, error, offline, success.
5. Design UX for dangerous/security-sensitive actions.
6. Implement the UI in the selected stack, or prepare a precise implementation spec if the codebase does not exist yet.
7. Add an accessibility checklist and UI smoke tests where practical.

## Acceptance Criteria

- the interface feels like a serious commercial product;
- there are no placeholder screens;
- navigation is clear;
- forms are polished;
- errors are useful;
- accessibility basics are covered;
- the design is original and consistent.`;
}

function directChromeExtensionRu(sourceText, detail = "detailed") {
  return `Ты — senior Chrome extension engineer и product-minded frontend developer.

## Цель

Создай production-ready Chrome Extension по запросу ниже.${sourceRu(sourceText)}

## Требования

- Manifest V3;
- minimal permissions;
- clean popup UI;
- options page, если нужны настройки;
- background service worker, если нужна фоновая логика;
- context menu, если полезно;
- local storage через chrome.storage;
- no hardcoded secrets;
- no unnecessary host permissions;
- clear error/empty/loading states;
- accessibility basics;
- clean packaging instructions.

## Implementation Plan

1. Определи extension flows.
2. Спроектируй manifest permissions минимально.
3. Реализуй popup/options/background modules.
4. Добавь локальное состояние и настройки.
5. Добавь tests или хотя бы manifest/static checks.
6. Добавь README с install/load-unpacked инструкциями.

## Acceptance Criteria

- extension загружается через chrome://extensions → Load unpacked;
- нет лишних permissions;
- UI аккуратный;
- core flow работает;
- есть документация;
- есть проверки.`;
}

function directChromeExtensionEn(sourceText, detail = "detailed") {
  return `You are a senior Chrome extension engineer and product-minded frontend developer.

## Goal

Create a production-ready Chrome Extension for the request below.${sourceEn(sourceText)}

## Requirements

- Manifest V3;
- minimal permissions;
- clean popup UI;
- options page when settings are needed;
- background service worker when background logic is needed;
- context menu when useful;
- local storage via chrome.storage;
- no hardcoded secrets;
- no unnecessary host permissions;
- clear error/empty/loading states;
- accessibility basics;
- clean packaging instructions.

## Implementation Plan

1. Identify extension flows.
2. Design manifest permissions minimally.
3. Implement popup/options/background modules.
4. Add local state and settings.
5. Add tests or at least manifest/static checks.
6. Add README with install/load-unpacked instructions.

## Acceptance Criteria

- extension loads through chrome://extensions → Load unpacked;
- no unnecessary permissions;
- UI is polished;
- core flow works;
- documentation exists;
- checks exist.`;
}

function directArchitectureReviewRu(sourceText) {
  return `Ты — principal software architect и technical reviewer.

## Задача

Проведи глубокий architecture review по материалу ниже.${sourceRu(sourceText)}

## Проанализируй

- цели продукта/системы;
- текущую или предлагаемую архитектуру;
- boundaries и responsibilities компонентов;
- data flow;
- state management;
- API contracts;
- storage/database choices;
- scalability;
- reliability;
- security;
- observability;
- deployment/operations;
- testing strategy.

## Вывод

Верни:

1. Executive summary.
2. Сильные стороны.
3. Главные риски.
4. Конкретные архитектурные проблемы.
5. Несколько вариантов улучшения.
6. Trade-offs.
7. Final recommendation.
8. Prioritized action plan.`;
}

function directArchitectureReviewEn(sourceText) {
  return `You are a principal software architect and technical reviewer.

## Task

Perform a deep architecture review for the material below.${sourceEn(sourceText)}

## Analyze

- product/system goals;
- current or proposed architecture;
- component boundaries and responsibilities;
- data flow;
- state management;
- API contracts;
- storage/database choices;
- scalability;
- reliability;
- security;
- observability;
- deployment/operations;
- testing strategy.

## Output

Return:

1. Executive summary.
2. Strengths.
3. Main risks.
4. Concrete architecture problems.
5. Several improvement options.
6. Trade-offs.
7. Final recommendation.
8. Prioritized action plan.`;
}

function directSecurityReviewRu(sourceText) {
  return `Ты — senior application security engineer и threat modeler.

## Задача

Проведи practical security review и threat model по материалу ниже.${sourceRu(sourceText)}

## Проверь

- assets and sensitive data;
- trust boundaries;
- authentication;
- authorization;
- session/token handling;
- secrets management;
- storage encryption;
- transport security;
- input validation;
- logging and telemetry;
- browser/mobile/desktop permissions;
- abuse cases;
- supply-chain risks;
- rate limiting and brute-force protection;
- privacy risks.

## Вывод

Верни:

1. Threat model summary.
2. Top risks by severity.
3. Exploit scenarios.
4. Recommended fixes.
5. Quick wins.
6. Long-term hardening plan.
7. Security testing checklist.`;
}

function directSecurityReviewEn(sourceText) {
  return `You are a senior application security engineer and threat modeler.

## Task

Perform a practical security review and threat model for the material below.${sourceEn(sourceText)}

## Review

- assets and sensitive data;
- trust boundaries;
- authentication;
- authorization;
- session/token handling;
- secrets management;
- storage encryption;
- transport security;
- input validation;
- logging and telemetry;
- browser/mobile/desktop permissions;
- abuse cases;
- supply-chain risks;
- rate limiting and brute-force protection;
- privacy risks.

## Output

Return:

1. Threat model summary.
2. Top risks by severity.
3. Exploit scenarios.
4. Recommended fixes.
5. Quick wins.
6. Long-term hardening plan.
7. Security testing checklist.`;
}

function rewriteRuShort(profile, sourceText) {
  return `${commonRewriteRuHeader(profile)}

Сохрани исходный смысл, цель и ограничения. Убери расплывчатые формулировки и замени их на четкие требования.

Сделай prompt:
${bulletList(profile.focusRu)}
- структурированным
- конкретным
- пригодным для практического использования

Верни только улучшенную версию prompt в Markdown.${sourceRu(sourceText)}`;
}

function rewriteRuDetailed(profile, sourceText) {
  return `${commonRewriteRuHeader(profile)}

Сохрани исходный смысл, цель, ограничения и важные детали. Не добавляй несвязанный функционал. Если есть неясности, сделай разумные предположения и явно зафиксируй их внутри переписанного prompt.

Улучши prompt по следующим направлениям:

## Цель
Опиши конечный результат так, чтобы исполнитель понял, что именно нужно получить.

## Scope
Раздели, что входит в работу, а что явно не входит.

## Требования
Сформулируй требования как конкретные, проверяемые пункты.

## Порядок работы
Добавь phases или последовательность действий, если задача сложная.

## Качество
Добавь требования к надежности, безопасности, UX, тестам или документации, если это следует из исходного текста.

## Критерии готовности
Добавь acceptance criteria и понятный формат финального результата.

Особый фокус:
${bulletList(profile.focusRu)}

Верни только улучшенный prompt в Markdown. Не объясняй, что ты изменил.${sourceRu(sourceText)}`;
}

function rewriteRuStrict(profile, sourceText) {
  return `${commonRewriteRuHeader(profile)}

Работай строго в режиме prompt rewrite. Не начинай реализацию задачи из исходного текста.

Правила:

1. Сохрани исходную цель и ограничения.
2. Не удаляй важные требования.
3. Не добавляй лишний scope, если он явно не следует из текста.
4. Преврати эмоциональные и нечеткие фразы в технические требования.
5. Добавь структуру, deliverables, risks, tests и acceptance criteria, где это уместно.
6. Если требуется автономный исполнитель, сформулируй режим самостоятельной работы без лишних вопросов.
7. Верни только финальный улучшенный prompt в Markdown.

Ключевой фокус:
${bulletList(profile.focusRu)}${sourceRu(sourceText)}`;
}

function rewriteEnConcise(profile, sourceText) {
  return `${commonRewriteEnHeader(profile)}

Preserve the original intent, goal and constraints. Replace vague or emotional language with clear, actionable requirements.

Make the prompt:
${bulletList(profile.focusEn)}
- structured
- specific
- practical
- suitable for execution

Return only the improved prompt in Markdown.${sourceEn(sourceText)}`;
}

function rewriteEnDetailed(profile, sourceText) {
  return `${commonRewriteEnHeader(profile)}

Preserve the original intent, goal, constraints and important details. Do not add unrelated features. If something is ambiguous, make a reasonable assumption and state it inside the rewritten prompt.

Improve the prompt using this structure:

## Goal
Describe the expected final result clearly.

## Scope
Separate what is included from what is explicitly out of scope.

## Requirements
Turn requirements into concrete, testable instructions.

## Work Plan
Add phases or ordered steps when the task is complex.

## Quality Bar
Add reliability, security, UX, testing or documentation requirements where they logically follow from the source text.

## Acceptance Criteria
Add clear completion criteria and final response format.

Special focus:
${bulletList(profile.focusEn)}

Return only the improved prompt in Markdown. Do not explain your changes.${sourceEn(sourceText)}`;
}

function rewriteEnStrict(profile, sourceText) {
  return `${commonRewriteEnHeader(profile)}

Work strictly in prompt-rewrite mode. Do not start implementing the task described in the source text.

Rules:

1. Preserve the original goal and constraints.
2. Do not remove important requirements.
3. Do not add unrelated scope unless it clearly follows from the source text.
4. Convert emotional or vague language into technical requirements.
5. Add structure, deliverables, risks, tests and acceptance criteria where appropriate.
6. If the prompt is for an autonomous agent, define autonomous execution rules and blocker rules.
7. Return only the final improved prompt in Markdown.

Key focus:
${bulletList(profile.focusEn)}${sourceEn(sourceText)}`;
}

function directBuilder(profileId, language, tone, sourceText) {
  if (profileId === PROFILE_IDS.GENERAL_REWRITE) {
    return language === "ru" ? directGeneralRewriteRu(sourceText) : directGeneralRewriteEn(sourceText);
  }
  if (profileId === PROFILE_IDS.CODEX_TASK) {
    return language === "ru" ? directCodexTaskRu(sourceText, tone) : directCodexTaskEn(sourceText, tone);
  }
  if (profileId === PROFILE_IDS.CODING_AGENT) {
    return language === "ru" ? directCodingAgentRu(sourceText, tone) : directCodingAgentEn(sourceText, tone);
  }
  if (profileId === PROFILE_IDS.AUTONOMOUS_CODING_AGENT) {
    return language === "ru" ? directAutonomousRu(sourceText) : directAutonomousEn(sourceText);
  }
  if (profileId === PROFILE_IDS.PRODUCT_REBUILD) {
    return language === "ru" ? directProductRebuildRu(sourceText, tone) : directProductRebuildEn(sourceText, tone);
  }
  if (profileId === PROFILE_IDS.PREMIUM_UI_UX) {
    return language === "ru" ? directPremiumUiRu(sourceText, tone) : directPremiumUiEn(sourceText, tone);
  }
  if (profileId === PROFILE_IDS.CHROME_EXTENSION_SPEC) {
    return language === "ru" ? directChromeExtensionRu(sourceText, tone) : directChromeExtensionEn(sourceText, tone);
  }
  if (profileId === PROFILE_IDS.ARCHITECTURE_REVIEW) {
    return language === "ru" ? directArchitectureReviewRu(sourceText) : directArchitectureReviewEn(sourceText);
  }
  if (profileId === PROFILE_IDS.SECURITY_REVIEW) {
    return language === "ru" ? directSecurityReviewRu(sourceText) : directSecurityReviewEn(sourceText);
  }
  return language === "ru" ? directGeneralRewriteRu(sourceText) : directGeneralRewriteEn(sourceText);
}

const VARIANT_META = [
  { id: "ru-short", language: "ru", title: "RU — короткий", tone: "short", rewriteBuilder: rewriteRuShort },
  { id: "ru-detailed", language: "ru", title: "RU — подробный", tone: "detailed", rewriteBuilder: rewriteRuDetailed },
  { id: "ru-strict", language: "ru", title: "RU — строгий / автономный", tone: "strict", rewriteBuilder: rewriteRuStrict },
  { id: "en-concise", language: "en", title: "EN — concise", tone: "concise", rewriteBuilder: rewriteEnConcise },
  { id: "en-detailed", language: "en", title: "EN — detailed", tone: "detailed", rewriteBuilder: rewriteEnDetailed },
  { id: "en-strict", language: "en", title: "EN — strict / autonomous", tone: "strict", rewriteBuilder: rewriteEnStrict }
];

export function generatePromptVariants({
  sourceText = "",
  profileId,
  languageMode = LANGUAGE_MODES.BOTH,
  generationMode = GENERATION_MODES.DIRECT
} = {}) {
  const normalizedText = normalizeSourceText(sourceText);
  const profile = getProfile(profileId);
  const variants = VARIANT_META.filter((variant) => {
    if (languageMode === LANGUAGE_MODES.RU_ONLY) return variant.language === "ru";
    if (languageMode === LANGUAGE_MODES.EN_ONLY) return variant.language === "en";
    return true;
  });

  return variants.map((variant) => {
    const content = generationMode === GENERATION_MODES.AI_REWRITE_REQUEST
      ? variant.rewriteBuilder(profile, normalizedText)
      : directBuilder(profile.id, variant.language, variant.tone, normalizedText);

    return {
      id: variant.id,
      title: generationMode === GENERATION_MODES.AI_REWRITE_REQUEST
        ? `${variant.title} — rewrite request`
        : `${variant.title} — ready prompt`,
      language: variant.language,
      tone: variant.tone,
      generationMode,
      profileId: profile.id,
      profileLabel: profile.label,
      content
    };
  });
}

export function buildBestPrompt({
  sourceText = "",
  profileId,
  language = "ru",
  generationMode = GENERATION_MODES.DIRECT
} = {}) {
  const languageMode = language === "en" ? LANGUAGE_MODES.EN_ONLY : LANGUAGE_MODES.RU_ONLY;
  const variants = generatePromptVariants({ sourceText, profileId, languageMode, generationMode });
  return variants.find((variant) => variant.tone === "detailed")?.content ?? variants[0]?.content ?? "";
}
