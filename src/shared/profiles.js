export const PROFILE_IDS = Object.freeze({
  GENERAL_REWRITE: "general-rewrite",
  CODEX_TASK: "codex-task",
  CODING_AGENT: "coding-agent",
  AUTONOMOUS_CODING_AGENT: "autonomous-coding-agent",
  PRODUCT_REBUILD: "product-rebuild",
  PREMIUM_UI_UX: "premium-ui-ux",
  CHROME_EXTENSION_SPEC: "chrome-extension-spec",
  ARCHITECTURE_REVIEW: "architecture-review",
  SECURITY_REVIEW: "security-review"
});

export const LANGUAGE_MODES = Object.freeze({
  BOTH: "both",
  RU_ONLY: "ru-only",
  EN_ONLY: "en-only"
});

export const GENERATION_MODES = Object.freeze({
  DIRECT: "direct",
  AI_REWRITE_REQUEST: "ai-rewrite-request"
});

export const PROMPT_PROFILES = Object.freeze([
  {
    id: PROFILE_IDS.GENERAL_REWRITE,
    label: "Prompt rewrite",
    shortLabel: "Rewrite",
    description: "Ask ChatGPT/Codex to turn rough text into a polished prompt.",
    roleRu: "expert prompt engineer",
    roleEn: "expert prompt engineer",
    focusRu: [
      "сохранить исходный смысл и ограничения",
      "убрать эмоциональные и расплывчатые формулировки",
      "добавить структуру, scope, deliverables и acceptance criteria",
      "вернуть только улучшенный prompt"
    ],
    focusEn: [
      "preserve the original intent and constraints",
      "remove emotional or vague wording",
      "add structure, scope, deliverables and acceptance criteria",
      "return only the improved prompt"
    ]
  },
  {
    id: PROFILE_IDS.CODEX_TASK,
    label: "Codex task",
    shortLabel: "Codex",
    description: "Create a strong task prompt for Codex app, Codex CLI, or Codex web.",
    roleRu: "senior Codex operator, software architect, full-stack developer, QA engineer и release engineer",
    roleEn: "senior Codex operator, software architect, full-stack developer, QA engineer and release engineer",
    focusRu: [
      "работать внутри существующего репозитория или создать новый проект, если репозитория нет",
      "сначала быстро понять контекст, структуру проекта и ограничения",
      "самостоятельно реализовать, протестировать и исправить изменения",
      "не задавать вопросы, если можно сделать разумное инженерное предположение",
      "в конце дать короткий отчет: что изменено, тесты, файлы, ограничения"
    ],
    focusEn: [
      "work inside the existing repository or create a new project if there is no repository",
      "quickly understand context, project structure and constraints first",
      "implement, test and fix changes autonomously",
      "avoid questions when a reasonable engineering assumption is possible",
      "finish with a short report: changes, tests, files and limitations"
    ]
  },
  {
    id: PROFILE_IDS.CODING_AGENT,
    label: "Coding agent",
    shortLabel: "Coding",
    description: "Convert rough requirements into a coding-agent-ready implementation prompt.",
    roleRu: "senior software architect, full-stack developer и QA automation engineer",
    roleEn: "senior software architect, full-stack developer and QA automation engineer",
    focusRu: [
      "восстановить требования и технический scope",
      "описать архитектуру и структуру проекта",
      "реализовать production-ready код",
      "добавить тесты, документацию и критерии готовности"
    ],
    focusEn: [
      "recover requirements and technical scope",
      "describe architecture and project structure",
      "implement production-ready code",
      "add tests, documentation and acceptance criteria"
    ]
  },
  {
    id: PROFILE_IDS.AUTONOMOUS_CODING_AGENT,
    label: "Autonomous coding agent",
    shortLabel: "Autonomous",
    description: "Make the agent work end-to-end without asking at every phase.",
    roleRu: "autonomous senior product engineer, software architect, full-stack developer, QA engineer и DevOps engineer",
    roleEn: "autonomous senior product engineer, software architect, full-stack developer, QA engineer and DevOps engineer",
    focusRu: [
      "работать автономно до завершения",
      "не задавать вопросы, если можно сделать разумное предположение",
      "создать build/test/fix loop",
      "спрашивать только при credentials, paid services, legal blockers или destructive actions",
      "в конце вернуть итоговый отчет"
    ],
    focusEn: [
      "work autonomously until completion",
      "avoid questions when a reasonable assumption is possible",
      "run a build/test/fix loop",
      "ask only for credentials, paid services, legal blockers or destructive actions",
      "return a final result report at the end"
    ]
  },
  {
    id: PROFILE_IDS.PRODUCT_REBUILD,
    label: "Product rebuild",
    shortLabel: "Rebuild",
    description: "Turn a broken-product complaint into a full rebuild prompt.",
    roleRu: "senior product engineer, software architect, security engineer, full-stack developer, UI/UX designer, QA engineer и release engineer",
    roleEn: "senior product engineer, software architect, security engineer, full-stack developer, UI/UX designer, QA engineer and release engineer",
    focusRu: [
      "пересоздать продукт с нуля, не рефакторить старый код",
      "использовать старый продукт только как read-only reference",
      "восстановить requirements, user flows и known issues",
      "спроектировать новую архитектуру, security model, sync model и UI",
      "реализовать, протестировать, задокументировать и подготовить релиз"
    ],
    focusEn: [
      "rebuild the product from scratch instead of refactoring old code",
      "use the old product only as read-only reference",
      "recover requirements, user flows and known issues",
      "design new architecture, security model, sync model and UI",
      "implement, test, document and prepare release artifacts"
    ]
  },
  {
    id: PROFILE_IDS.PREMIUM_UI_UX,
    label: "Premium UI / UX",
    shortLabel: "UI/UX",
    description: "Create a strong prompt for premium cross-platform UI.",
    roleRu: "senior UI/UX designer, design systems architect и frontend/mobile engineer",
    roleEn: "senior UI/UX designer, design systems architect and frontend/mobile engineer",
    focusRu: [
      "создать premium production-ready UI, а не prototype-quality screens",
      "следовать best practices каждой платформы",
      "создать design system, light/dark themes и accessibility rules",
      "реализовать loading, empty, error, offline и success states",
      "не копировать интерфейс конкурентов"
    ],
    focusEn: [
      "create premium production-ready UI, not prototype-quality screens",
      "follow each platform's best practices",
      "create a design system, light/dark themes and accessibility rules",
      "implement loading, empty, error, offline and success states",
      "do not copy competitor interfaces"
    ]
  },
  {
    id: PROFILE_IDS.CHROME_EXTENSION_SPEC,
    label: "Chrome extension spec",
    shortLabel: "Extension",
    description: "Create a Manifest V3 Chrome Extension implementation prompt.",
    roleRu: "senior Chrome extension engineer и product-minded frontend developer",
    roleEn: "senior Chrome extension engineer and product-minded frontend developer",
    focusRu: [
      "использовать Manifest V3",
      "минимизировать permissions",
      "спроектировать popup, options page, service worker и context menu",
      "не хранить secrets в extension",
      "добавить clear UX, tests и packaging instructions"
    ],
    focusEn: [
      "use Manifest V3",
      "minimize permissions",
      "design popup, options page, service worker and context menu",
      "do not store secrets in the extension",
      "add clear UX, tests and packaging instructions"
    ]
  },
  {
    id: PROFILE_IDS.ARCHITECTURE_REVIEW,
    label: "Architecture review",
    shortLabel: "Architecture",
    description: "Ask for a deep technical architecture review with trade-offs.",
    roleRu: "principal software architect и technical reviewer",
    roleEn: "principal software architect and technical reviewer",
    focusRu: [
      "проанализировать requirements, architecture, data flow и risks",
      "найти слабые места, coupling, scalability issues и operational risks",
      "предложить несколько вариантов улучшения",
      "описать trade-offs и final recommendation"
    ],
    focusEn: [
      "analyze requirements, architecture, data flow and risks",
      "identify weak points, coupling, scalability issues and operational risks",
      "propose several improvement options",
      "explain trade-offs and final recommendation"
    ]
  },
  {
    id: PROFILE_IDS.SECURITY_REVIEW,
    label: "Security review",
    shortLabel: "Security",
    description: "Ask for a practical security threat model and hardening plan.",
    roleRu: "senior application security engineer и threat modeler",
    roleEn: "senior application security engineer and threat modeler",
    focusRu: [
      "построить threat model",
      "найти sensitive data, trust boundaries и abuse cases",
      "проверить auth, storage, logging, transport, permissions и secrets handling",
      "дать prioritized remediation plan"
    ],
    focusEn: [
      "build a threat model",
      "identify sensitive data, trust boundaries and abuse cases",
      "review auth, storage, logging, transport, permissions and secrets handling",
      "provide a prioritized remediation plan"
    ]
  }
]);

export function getProfile(profileId) {
  return PROMPT_PROFILES.find((profile) => profile.id === profileId) ?? PROMPT_PROFILES[0];
}
