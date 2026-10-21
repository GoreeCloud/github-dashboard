import fs from "node:fs";

const requiredFiles = [
  "COMPETITIVE-OBJECTIVES.md",
  "FEATURES.md",
  "IMPLEMENTED-FEATURES.md",
  "PLANNED-FEATURES.md",
  "CHANGELOGS.md",
  "BENEFITS.md",
  "USER-MANUAL.md",
  "PRIVACY POLICY.md",
  "NOTES.md",
  "goreecloud.platform.yaml",
  "docs/GC_UI_MIGRATION.md",
  "docs/PLATFORM_CONFORMANCE.md",
  "docs/OPERATIONAL_HEALTH.md",
  "docs/PUBLIC_SOURCE_BOUNDARY.md",
  "docs/GOVERNANCE_CONTROL_PLANE.md",
  "public/gc-ui-bridge.js",
  "public/gc-ui-shell.css",
  "public/theme-policy.js",
  "public/appearance-controller.js",
  "public/governance.html",
  "public/governance.js",
  "functions/api/health.js",
  "functions/api/ready.js",
  "functions/lib/governance.js",
  "functions/lib/rulesets.js",
  "scripts/validate-public-source.mjs",
  "tests/gc-ui-conformance.test.mjs",
  "tests/appearance-policy.test.mjs",
  "tests/health-readiness.test.mjs",
  "tests/governance.test.mjs",
  "tests/rulesets.test.mjs",
  "tests/public-source-policy.test.mjs",
  ".github/workflows/platform-contract.yml",
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`Missing product/conformance record: ${file}`);
}

if (!failures.length) {
  const readme = fs.readFileSync("README.md", "utf8");
  const app = fs.readFileSync("public/app.js", "utf8");
  const bootstrap = fs.readFileSync("public/bootstrap.js", "utf8");
  const governanceBootstrap = fs.readFileSync("public/governance-bootstrap.js", "utf8");
  const governancePage = fs.readFileSync("public/governance.html", "utf8");
  const governanceRenderer = fs.readFileSync("public/governance.js", "utf8");
  const governanceSource = fs.readFileSync("functions/lib/governance.js", "utf8");
  const rulesetsSource = fs.readFileSync("functions/lib/rulesets.js", "utf8");
  const githubSource = fs.readFileSync("functions/lib/github.js", "utf8");
  const governanceDocs = fs.readFileSync("docs/GOVERNANCE_CONTROL_PLANE.md", "utf8");
  const gcUiRuntime = fs.readFileSync("public/gc-ui-bridge.js", "utf8");
  const gcUiMapping = fs.readFileSync("docs/GC_UI_MIGRATION.md", "utf8");
  const gcUiCss = fs.readFileSync("public/gc-ui-shell.css", "utf8");
  const themePolicy = fs.readFileSync("public/theme-policy.js", "utf8");
  const appearanceController = fs.readFileSync("public/appearance-controller.js", "utf8");
  const platform = fs.readFileSync("docs/PLATFORM_CONFORMANCE.md", "utf8");
  const manifest = fs.readFileSync("goreecloud.platform.yaml", "utf8");
  const platformWorkflow = fs.readFileSync(".github/workflows/platform-contract.yml", "utf8");
  const health = fs.readFileSync("functions/api/health.js", "utf8");
  const ready = fs.readFileSync("functions/api/ready.js", "utf8");
  const publicSourceBoundary = fs.readFileSync("docs/PUBLIC_SOURCE_BOUNDARY.md", "utf8");
  const publicSourceValidator = fs.readFileSync("scripts/validate-public-source.mjs", "utf8");

  for (const record of ["COMPETITIVE-OBJECTIVES.md", "FEATURES.md", "IMPLEMENTED-FEATURES.md", "PLANNED-FEATURES.md", "CHANGELOGS.md", "BENEFITS.md", "USER-MANUAL.md", "PRIVACY POLICY.md", "NOTES.md"]) {
    if (!readme.includes(record)) failures.push(`README must link ${record}`);
  }

  if (!githubSource.includes('const CHANGELOG_PATHS = ["CHANGELOGS.md", "CHANGELOG.md", "docs/CHANGELOG.md", "changelog.md"];')) {
    failures.push("GitHub aggregation must prefer current GoreeCloud CHANGELOGS.md while retaining legacy fallback paths.");
  }

  if (!/public(?:\s*\/\s*|\s+and\s+)open[- ]source/i.test(readme)) {
    failures.push("README must state the intentional public/open-source repository model.");
  }
  if (!/private(?:\s+and)?\s+authenticated/i.test(readme)) {
    failures.push("README must preserve the private authenticated operational deployment model.");
  }
  if (!/public, open-source repository/i.test(publicSourceBoundary)) {
    failures.push("Public source boundary must explicitly declare public/open-source source visibility.");
  }
  if (!/private, authenticated deployment/i.test(publicSourceBoundary)) {
    failures.push("Public source boundary must explicitly preserve private authenticated deployment.");
  }
  for (const marker of [
    "detectSecretMarkers",
    "isForbiddenPublicArtifact",
    "GITHUB_TOKEN",
    "api\\.github\\.com",
    "ACCESS_GATE_CONFIRMED=false",
    'packageJson.private !== true',
  ]) {
    if (!publicSourceValidator.includes(marker)) failures.push(`Public source validator missing required marker: ${marker}`);
  }

  const expectedBootstrapOrder = [
    'import "./gc-ui-bridge.js";',
    'import "./appearance-controller.js";',
    'import "./refresh-guard.js";',
    'import "./app.js";',
  ];
  let previousIndex = -1;
  for (const statement of expectedBootstrapOrder) {
    const index = bootstrap.indexOf(statement);
    if (index <= previousIndex) failures.push(`Bootstrap order must include ${statement} after the prior migration boundary.`);
    previousIndex = index;
  }
  if (!governanceBootstrap.includes('import "./appearance-controller.js";')) {
    failures.push("Governance view must use the shared four-state appearance controller.");
  }

  for (const marker of [
    'baselineModel: "application-service-fourteen-file-repository-baseline"',
    'scope: "platform-contract-declaration-evidence"',
    'interpretation: "declaration-only"',
    "parsePlatformDeclaration",
    "implementedFeatures",
    "plannedFeatures",
    "changelogs",
    "userManual",
    "privacyPolicy",
    "notes",
    "gitignore",
    "buildClassicBranchProtectionGraphqlQuery",
    "branchProtectionRules(first:",
    "matchingRefs(first:",
    "pageInfo?.hasNextPage",
    "classicBranchProtection",
    'scope: "classic-default-branch-rules"',
  ]) {
    if (!governanceSource.includes(marker)) failures.push(`Governance source missing classic-protection invariant: ${marker}`);
  }
  for (const marker of [
    'RULESET_API_VERSION = "2026-03-10"',
    "/rules/branches/",
    "RULESET_PAGE_SIZE = 100",
    "DEFAULT_RULESET_CONCURRENCY = 6",
    "MAX_RULESET_CONCURRENCY = 8",
    'scope: "active-default-branch-rulesets"',
    "Promise.allSettled",
    'type === "workflows"',
    "normalizeRequiredWorkflow",
    "repositoryId",
    "requiredWorkflows",
    "repositoriesWithRequiredWorkflowRules",
    "observedRequiredWorkflowReferences",
    'workflowObservationModel: "active-ruleset-required-workflow-references"',
  ]) {
    if (!rulesetsSource.includes(marker)) failures.push(`Governance ruleset source missing invariant: ${marker}`);
  }
  if (!governancePage.includes("All 14 required repository paths present")) failures.push("Governance page must expose the current fourteen-file application/service baseline.");
  if (!governancePage.includes('id="platform-declarations"')) failures.push("Governance page must expose bounded Platform Contract declaration evidence.");
  if (!governancePage.includes('id="classic-protection"') || !governancePage.includes('id="stat-classic-protected"')) {
    failures.push("Governance page must expose the classic default-branch protection surface.");
  }
  if (!governancePage.includes('id="rulesets"') || !governancePage.includes('id="stat-rulesets-active"')) {
    failures.push("Governance page must expose the active default-branch ruleset surface.");
  }
  if (!governancePage.includes('id="required-workflows"') || !governancePage.includes('id="stat-required-workflows"')) {
    failures.push("Governance page must expose required-workflow reference observation.");
  }
  for (const marker of [
    "Classic branch-protection rules are shown separately from active ruleset rules",
    "No enabled active ruleset rules returned for this default branch",
    "evaluate/disabled rulesets are outside this view",
    "Workflow rule observed",
    "GoreeCloud policy satisfaction is not evaluated by this view",
    "not a policy-failure classification",
  ]) {
    if (!governanceRenderer.includes(marker)) failures.push(`Governance renderer missing evidence-boundary wording: ${marker}`);
  }
  for (const marker of [
    "## Active ruleset observation",
    "## Required-workflow reference observation",
    "workflow file `path`",
    "does not invent a name",
    "## Independent fail-soft channels",
    "None of these labels is a repository compliance classification",
  ]) {
    if (!governanceDocs.includes(marker)) failures.push(`Governance documentation missing ruleset/workflow boundary: ${marker}`);
  }
  if (/\b(?:non)?compliant\b/i.test(governanceRenderer)) {
    failures.push("Governance renderer must remain observational and must not classify repositories as compliant/noncompliant.");
  }

  if (!gcUiRuntime.includes('dataset.gcUiAcceptance="pending"')) failures.push("GC UI acceptance must remain pending.");
  if (!gcUiMapping.includes("3ffe26a1c62f59a2ee3c9478dcb31ecc0f9cf444")) failures.push("GC UI mapping must record its pinned token source.");
  for(const mode of ["System","Light","Dark","Deep Dark"]) if(!gcUiMapping.includes(mode)) failures.push("GC UI mapping must document "+mode);
  if (!themePolicy.includes('Object.freeze(["system", "light", "dark", "deep-dark"])')) {
    failures.push("Appearance policy must retain the governed four-state cycle.");
  }
  if (!appearanceController.includes('button.addEventListener("click"')) {
    failures.push("Shared appearance controller must own the appearance control directly.");
  }
  if (!appearanceController.includes('dataset.appearanceController = "installed"')) {
    failures.push("Appearance controller must install idempotently.");
  }
  if (appearanceController.includes("stopImmediatePropagation")) {
    failures.push("Appearance controller must not depend on the superseded capture-phase migration guard.");
  }
  for (const legacyMarker of ["function applyTheme(", "function toggleTheme(", "function initializeTheme("]) {
    if (app.includes(legacyMarker)) failures.push(`Dashboard renderer must not retain legacy binary theme code: ${legacyMarker}`);
  }
  if (!gcUiCss.includes("var(--gc-surface)") || !gcUiCss.includes("min-height: 48px")) failures.push("GC UI shell must provide semantic surfaces and touch targets.");
  if (!fs.existsSync("public/gc-ui-foundations.css") || !fs.existsSync("public/gc-ui-adapter.css")) failures.push("GC UI foundations and adapter missing.");
  if (fs.existsSync("public/glaze-ui.js") || fs.existsSync("public/glaze-v1.6.css")) failures.push("Retired design assets must not ship in public.");
  for (const system of [
    "GoreeCloud Manager",
    "Privacy Shield",
    "Wardveil Security",
    "Everkeep",
    "GoreeCloud UI",
    "GoreeCloud Mesh",
    "GoreeCloud Identity",
    "GoreeCloud Policy",
    "GoreeCloud Observability",
  ]) {
    if (!platform.includes(system)) failures.push(`Platform conformance must evaluate ${system}.`);
  }

  for (const marker of [
    'schema_version: "2.0"',
    "component:\n  type: application\n  id: github-dashboard",
    "repository: GoreeCloud/github-dashboard",
    "lifecycle: forge",
    "version: 0.3.0-dev",
    'glaze_ui_required: "1.6.0"',
    "health_endpoint: /api/health",
    "readiness_endpoint: /api/ready",
    "status: nonconformant",
  ]) {
    if (!manifest.includes(marker)) failures.push(`Platform manifest missing required marker: ${marker}`);
  }

  if (manifest.includes("result: applicable-conformant")) {
    failures.push("Forge manifest must not claim an accepted platform-system integration without evidence.");
  }

  for (const source of [health, ready]) {
    if (!source.includes('"Cache-Control": "private, no-store, max-age=0"')) {
      failures.push("Operational endpoints must remain private no-store.");
    }
    if (!source.includes('mode: "read-only"')) {
      failures.push("Operational endpoints must retain the read-only mode declaration.");
    }
  }
  if (!ready.includes("ACCESS_GATE_CONFIRMED") || !ready.includes("GITHUB_TOKEN")) {
    failures.push("Readiness must fail closed on both private-access confirmation and GitHub credential configuration.");
  }
  if (!ready.includes('code: "deployment_not_ready"')) {
    failures.push("Readiness must retain a generic not-ready response code.");
  }

  if (!platformWorkflow.includes("32cfe6395f6e4bc4872a99e8d0c666ea0b1ed7b8")) {
    failures.push("Platform Contract validation must pin the reviewed central implementation revision.");
  }
  if (!platformWorkflow.includes("github.event.pull_request.head.sha")) {
    failures.push("Platform Contract validation must resolve pull requests to the exact head SHA.");
  }
  if (!platformWorkflow.includes("result['anchor_eligible'] is False")) {
    failures.push("Platform Contract workflow must verify Forge remains fail-closed and is not Anchor-eligible.");
  }
}

if (failures.length) {
  console.error("Product/conformance validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Product/conformance validation passed.");
