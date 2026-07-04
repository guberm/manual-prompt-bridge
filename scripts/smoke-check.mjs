import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const requiredFiles = [
  manifest.side_panel?.default_path,
  manifest.options_page,
  manifest.background?.service_worker,
  ...Object.values(manifest.icons ?? {})
].filter(Boolean);

console.assert(manifest.manifest_version === 3, "manifest_version must be 3");
console.assert(manifest.permissions.includes("sidePanel"), "sidePanel permission is required");
console.assert(manifest.side_panel?.default_path === "src/rewrite.html", "side panel must use rewrite.html");
console.assert(!manifest.action.default_popup, "action default_popup must stay disabled");
console.assert(!manifest.host_permissions, "host permissions are intentionally not used");

for (const file of requiredFiles) {
  console.assert(existsSync(file), `Missing manifest file: ${file}`);
}

const jsFiles = [
  "src/background.js",
  "src/options.js",
  "src/rewrite.js",
  "src/shared/chromeStorage.js",
  "src/shared/defaults.js",
  "src/shared/profiles.js",
  "src/shared/promptGenerator.js"
];

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${file} failed syntax check:\n${result.stderr || result.stdout}`);
  }
}

console.log("Smoke check passed.");
