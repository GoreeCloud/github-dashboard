import { githubRequest } from "./github.js";

const SECURITY_PROBE = Object.freeze({ key: "security", label: "SECURITY", path: "SECURITY.md" });

export const GOVERNANCE_PROBES = Object.freeze([
  Object.freeze({ key: "platformContract", label: "Platform Contract", path: "goreecloud.platform.yaml" }),
  SECURITY_PROBE,
  Object.freeze({ key: "contributing", label: "CONTRIBUTING", path: "CONTRIBUTING.md" }),
  Object.freeze({ key: "codeowners", label: "CODEOWNERS", path: ".github/CODEOWNERS" }),
]);

export const DOCUMENTATION_PROBES = Object.freeze([
  Object.freeze({ key: "readme", label: "README", path: "README.md" }),
  Object.freeze({ key: "specifications", label: "SPECIFICATIONS", path: "SPECIFICATIONS.md" }),
  Object.freeze({ key: "features", label: "FEATURES", path: "FEATURES.md" }),
  Object.freeze({ key: "implementedFeatures", label: "IMPLEMENTED-FEATURES", path: "IMPLEMENTED-FEATURES.md" }),
  Object.freeze({ key: "plannedFeatures", label: "PLANNED-FEATURES", path: "PLANNED-FEATURES.md" }),
  Object.freeze({ key: "changelogs", label: "CHANGELOGS", path: "CHANGELOGS.md" }),
  Object.freeze({ key: "benefits", label: "BENEFITS", path: "BENEFITS.md" }),
  Object.freeze({
    key: "competitiveObjectives",
    label: "COMPETITIVE-OBJECTIVES",
    path: "COMPETITIVE-OBJECTIVES.md",
  }),
  Object.freeze({ key: "branding", label: "BRANDING", path: "BRANDING.md" }),
  Object.freeze({ key: "userManual", label: "USER-MANUAL", path: "USER-MANUAL.md" }),
  Object.freeze({ key: "privacyPolicy", label: "PRIVACY POLICY", path: "PRIVACY POLICY.md" }),
  Object.freeze({ key: "notes", label: "NOTES", path: "NOTES.md" }),
  SECURITY_PROBE,
  Object.freeze({ key: "gitignore", label: ".gitignore", path: ".gitignore" }),
]);

const ALL_FILE_PROBES = Object.freeze([
  ...new Map(
    [...GOVERNANCE_PROBES, ...DOCUMENTATION_PROBES].map((probe) => [probe.key, probe]),
  ).values(),
]);
const DEFAULT_BATCH_SIZE = 20;
const MAX_BATCH_SIZE = 25;
const MAX_BRANCH_PROTECTION_RULES = 100;
const MAX_MATCHING_REFS = 10;
const MAX_STATUS_CONTEXTS = 20;
const MAX_PLATFORM_CONTRACT_BYTES = 32 * 1024;
const APPLICABLE_COMPONENT_TYPES = new Set(["application", "service"]);

function boundedBatchSize(value = DEFAULT_BATCH_SIZE) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_BATCH_SIZE;
  return Math.min(MAX_BATCH_SIZE, Math.max(1, Math.floor(numeric)));
}

function quoted(value) {
  return JSON.stringify(String(value));
}

function repositoryExpression(repository, path) {
  const branch = repository.default_branch || "main";
  return `${branch}:${path}`;
}

function coverageStatus(total, checked, unavailable) {
  if (total > 0 && checked === 0 && unavailable > 0) return "unavailable";
  if (unavailable > 0) return "partial";
  return "complete";
}

function combinedCoverageStatus(...statuses) {
  if (statuses.every((status) => status === "complete")) return "complete";
  if (statuses.every((status) => status === "unavailable")) return "unavailable";
  return "partial";
}

function simpleYamlScalar(line, key) {
  const match = line.trim().match(/^([A-Za-z0-9_.-]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|([A-Za-z0-9._-]+))\s*(?:#.*)?$/);
  if (!match || match[1].toLowerCase() !== key.toLowerCase()) return null;
  return match[2] ?? match[3] ?? match[4] ?? null;
}

function nestedScalar(lines, section, key) {
  let sectionIndent = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;

    if (sectionIndent === null) {
      const heading = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:\s*(?:#.*)?$/);
      if (heading && heading[1].toLowerCase() === section.toLowerCase()) sectionIndent = indent;
      continue;
    }

    if (indent <= sectionIndent) break;
    const value = simpleYamlScalar(rawLine, key);
    if (value !== null) return value;
  }

  return null;
}

function topLevelScalar(lines, key) {
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    if (indent !== 0) continue;
    const value = simpleYamlScalar(rawLine, key);
    if (value !== null) return value;
  }
  return null;
}

export function parsePlatformDeclaration(text) {
  if (typeof text !== "string" || !text.trim()) {
    return {
      schemaVersion: null,
      componentType: null,
      lifecycle: null,
      platformContract: null,
      glazeUiRequired: null,
      declaredConformance: null,
    };
  }

  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const componentType = nestedScalar(lines, "component", "type");
  const declaredConformance = nestedScalar(lines, "conformance", "status");

  return {
    schemaVersion: topLevelScalar(lines, "schema_version"),
    componentType: ["application", "service", "shared-library"].includes(componentType?.toLowerCase())
      ? componentType.toLowerCase()
      : null,
    lifecycle: topLevelScalar(lines, "lifecycle")?.toLowerCase() || null,
    platformContract: nestedScalar(lines, "compatibility", "platform_contract"),
    glazeUiRequired: nestedScalar(lines, "compatibility", "glaze_ui_required"),
    declaredConformance: ["conformant", "nonconformant", "unverified"].includes(declaredConformance?.toLowerCase())
      ? declaredConformance.toLowerCase()
      : null,
  };
}

export function parsePlatformComponentType(text) {
  const componentType = parsePlatformDeclaration(text).componentType;
  return APPLICABLE_COMPONENT_TYPES.has(componentType) ? componentType : null;
}

function platformDeclarationObservation(node, observationAvailable = true) {
  if (!observationAvailable) {
    return {
      status: "unavailable",
      source: null,
      interpretation: "declaration-only",
      fullValidationPerformed: false,
      reason: "file-observation-unavailable",
      declaration: null,
    };
  }

  if (!node?.oid) {
    return {
      status: "absent",
      source: null,
      interpretation: "declaration-only",
      fullValidationPerformed: false,
      reason: "platform-contract-absent",
      declaration: null,
    };
  }

  const byteSize = Number(node.byteSize);
  if (Number.isFinite(byteSize) && byteSize > MAX_PLATFORM_CONTRACT_BYTES) {
    return {
      status: "unavailable",
      source: "goreecloud.platform.yaml",
      interpretation: "declaration-only",
      fullValidationPerformed: false,
      reason: "platform-contract-too-large",
      declaration: null,
    };
  }

  if (typeof node.text !== "string") {
    return {
      status: "unavailable",
      source: "goreecloud.platform.yaml",
      interpretation: "declaration-only",
      fullValidationPerformed: false,
      reason: "platform-contract-text-unavailable",
      declaration: null,
    };
  }

  const declaration = parsePlatformDeclaration(node.text);
  const recognized = Object.values(declaration).some((value) => value !== null);

  return {
    status: "observed",
    source: "goreecloud.platform.yaml",
    interpretation: "declaration-only",
    fullValidationPerformed: false,
    reason: recognized ? "bounded-declaration-observed" : "declaration-partial-or-unrecognized",
    declaration,
  };
}

function platformRoleObservation(node, observationAvailable = true) {
  if (!observationAvailable) {
    return {
      status: "unclassified",
      componentType: null,
      source: null,
      reason: "file-observation-unavailable",
    };
  }

  if (!node?.oid) {
    return {
      status: "unclassified",
      componentType: null,
      source: null,
      reason: "platform-contract-absent",
    };
  }

  const byteSize = Number(node.byteSize);
  if (Number.isFinite(byteSize) && byteSize > MAX_PLATFORM_CONTRACT_BYTES) {
    return {
      status: "unclassified",
      componentType: null,
      source: "goreecloud.platform.yaml",
      reason: "platform-contract-too-large",
    };
  }

  if (typeof node.text !== "string") {
    return {
      status: "unclassified",
      componentType: null,
      source: "goreecloud.platform.yaml",
      reason: "platform-contract-text-unavailable",
    };
  }

  const componentType = parsePlatformComponentType(node.text);
  if (!componentType) {
    return {
      status: "unclassified",
      componentType: null,
      source: "goreecloud.platform.yaml",
      reason: "component-type-unrecognized",
    };
  }

  return {
    status: "applicable",
    componentType,
    source: "goreecloud.platform.yaml",
    reason: "explicit-platform-contract-component-type",
  };
}

export function buildGovernanceGraphqlQuery(owner, repositories) {
  const fields = repositories.map((repository, index) => {
    const probes = ALL_FILE_PROBES.map((probe) => {
      const expression = quoted(repositoryExpression(repository, probe.path));
      if (probe.key === "platformContract") {
        return `${probe.key}: object(expression: ${expression}) { oid ... on Blob { byteSize text } }`;
      }
      return `${probe.key}: object(expression: ${expression}) { oid }`;
    }).join("\n      ");

    return `r${index}: repository(owner: ${quoted(owner)}, name: ${quoted(repository.name)}) {\n      name\n      ${probes}\n    }`;
  }).join("\n    ");

  return `query GoreeCloudGovernanceObservation {\n    ${fields}\n  }`;
}

export function buildClassicBranchProtectionGraphqlQuery(owner, repositories) {
  const fields = repositories.map((repository, index) => {
    const defaultBranch = repository.default_branch || "main";
    return `r${index}: repository(owner: ${quoted(owner)}, name: ${quoted(repository.name)}) {\n      name\n      branchProtectionRules(first: ${MAX_BRANCH_PROTECTION_RULES}) {\n        pageInfo { hasNextPage }\n        nodes {\n          pattern\n          allowsDeletions\n          allowsForcePushes\n          isAdminEnforced\n          requireLastPushApproval\n          requiredApprovingReviewCount\n          requiredStatusCheckContexts\n          requiresApprovingReviews\n          requiresCodeOwnerReviews\n          requiresCommitSignatures\n          requiresConversationResolution\n          requiresLinearHistory\n          requiresStatusChecks\n          requiresStrictStatusChecks\n          matchingRefs(first: ${MAX_MATCHING_REFS}, query: ${quoted(defaultBranch)}) {\n            pageInfo { hasNextPage }\n            nodes { name }\n          }\n        }\n      }\n    }`;
  }).join("\n    ");

  return `query GoreeCloudClassicBranchProtectionObservation {\n    ${fields}\n  }`;
}

function normalizedRepository(repository) {
  return {
    name: repository.name,
    url: repository.html_url,
    visibility: repository.visibility || (repository.private ? "private" : "public"),
    private: Boolean(repository.private),
    archived: Boolean(repository.archived),
    defaultBranch: repository.default_branch || "main",
    updatedAt: repository.pushed_at || repository.updated_at || null,
  };
}

function normalizedProtectionRule(rule) {
  const contexts = Array.isArray(rule.requiredStatusCheckContexts)
    ? rule.requiredStatusCheckContexts.filter((value) => typeof value === "string").slice(0, MAX_STATUS_CONTEXTS)
    : [];

  return {
    pattern: typeof rule.pattern === "string" ? rule.pattern : null,
    allowsDeletions: rule.allowsDeletions === true,
    allowsForcePushes: rule.allowsForcePushes === true,
    isAdminEnforced: rule.isAdminEnforced === true,
    requireLastPushApproval: rule.requireLastPushApproval === true,
    requiredApprovingReviewCount: Number.isFinite(Number(rule.requiredApprovingReviewCount))
      ? Math.max(0, Number(rule.requiredApprovingReviewCount))
      : 0,
    requiredStatusCheckContexts: contexts,
    requiresApprovingReviews: rule.requiresApprovingReviews === true,
    requiresCodeOwnerReviews: rule.requiresCodeOwnerReviews === true,
    requiresCommitSignatures: rule.requiresCommitSignatures === true,
    requiresConversationResolution: rule.requiresConversationResolution === true,
    requiresLinearHistory: rule.requiresLinearHistory === true,
    requiresStatusChecks: rule.requiresStatusChecks === true,
    requiresStrictStatusChecks: rule.requiresStrictStatusChecks === true,
  };
}

function normalizeClassicProtectionNode(repository, node) {
  if (!node || node.name !== repository.name) {
    return {
      repository: repository.name,
      available: false,
      defaultBranchProtected: null,
      matchingRules: [],
    };
  }

  const connection = node.branchProtectionRules;
  if (!connection || !Array.isArray(connection.nodes)) {
    return {
      repository: repository.name,
      available: false,
      defaultBranchProtected: null,
      matchingRules: [],
    };
  }

  const defaultBranch = repository.default_branch || "main";
  let incomplete = connection.pageInfo?.hasNextPage === true;
  const matchingRules = [];

  for (const rule of connection.nodes) {
    if (!rule || !rule.matchingRefs || !Array.isArray(rule.matchingRefs.nodes)) {
      incomplete = true;
      continue;
    }

    const exactMatch = rule.matchingRefs.nodes.some((ref) => ref?.name === defaultBranch);
    if (exactMatch) matchingRules.push(normalizedProtectionRule(rule));
    else if (rule.matchingRefs.pageInfo?.hasNextPage === true) incomplete = true;
  }

  if (matchingRules.length === 0 && incomplete) {
    return {
      repository: repository.name,
      available: false,
      defaultBranchProtected: null,
      matchingRules: [],
    };
  }

  return {
    repository: repository.name,
    available: true,
    defaultBranchProtected: matchingRules.length > 0,
    matchingRules,
  };
}

function probeSummary(rows, probes, selector, checkedRepositories, unavailableRepositories, status) {
  return probes.map((probe) => {
    const present = rows.filter((row) => (
      selector(row)?.available === true && selector(row).presentChecks.includes(probe.key)
    )).length;
    return {
      key: probe.key,
      label: probe.label,
      path: probe.path,
      checked: checkedRepositories,
      present,
      absent: Math.max(0, checkedRepositories - present),
      unavailable: unavailableRepositories,
      status,
    };
  });
}

function summaryApplicability(classifiedRepositories, unclassifiedRepositories) {
  if (classifiedRepositories === 0) return "repository-role-unclassified";
  if (unclassifiedRepositories === 0) return "platform-contract-component-type";
  return "mixed-platform-contract-component-type";
}

export function buildGovernanceCoverage(repositories, observations = [], protectionObservations = []) {
  const observationByRepository = new Map(observations.map((observation) => [observation.repository, observation]));
  const protectionByRepository = new Map(
    protectionObservations.map((observation) => [observation.repository, observation]),
  );

  const rows = repositories.map((repository) => {
    const normalized = normalizedRepository(repository);
    const observation = observationByRepository.get(repository.name);
    const available = observation?.available === true;
    const presence = available ? observation.presence || {} : {};
    const presentChecks = available
      ? GOVERNANCE_PROBES.filter((probe) => presence[probe.key] === true).map((probe) => probe.key)
      : [];
    const missingChecks = available
      ? GOVERNANCE_PROBES.filter((probe) => presence[probe.key] !== true).map((probe) => probe.key)
      : [];
    const documentationPresentChecks = available
      ? DOCUMENTATION_PROBES.filter((probe) => presence[probe.key] === true).map((probe) => probe.key)
      : [];
    const documentationMissingChecks = available
      ? DOCUMENTATION_PROBES.filter((probe) => presence[probe.key] !== true).map((probe) => probe.key)
      : [];
    const documentationApplicability = observation?.documentationApplicability || platformRoleObservation(null, available);
    const platformDeclaration = observation?.platformDeclaration || platformDeclarationObservation(null, available);

    const protection = protectionByRepository.get(repository.name);
    const protectionAvailable = protection?.available === true;

    return {
      ...normalized,
      status: available ? (missingChecks.length ? "gaps" : "observed") : "unavailable",
      checksAvailable: available,
      presentChecks,
      missingChecks,
      platformDeclaration,
      documentation: {
        available,
        status: available ? (documentationMissingChecks.length ? "gaps" : "observed") : "unavailable",
        applicability: documentationApplicability,
        presentChecks: documentationPresentChecks,
        missingChecks: documentationMissingChecks,
      },
      platformDeclarations: {
      status: platformDeclarationStatus,
      scope: "platform-contract-declaration-evidence",
      interpretation: "declaration-only",
      fullValidationPerformed: false,
      checkedRepositories: platformDeclarationCheckedRepositories,
      observedRepositories: platformDeclarationObservedRows.length,
      absentRepositories: platformDeclarationAbsentRepositories,
      unavailableRepositories: platformDeclarationUnavailableRepositories,
      contract2DeclaredRepositories: platformContract2DeclaredRepositories,
      applicationRepositories: platformApplicationRepositories,
      serviceRepositories: platformServiceRepositories,
      sharedLibraryRepositories: platformSharedLibraryRepositories,
    },
    classicBranchProtection: {
        available: protectionAvailable,
        defaultBranchProtected: protectionAvailable ? protection.defaultBranchProtected === true : null,
        matchingRules: protectionAvailable && Array.isArray(protection.matchingRules) ? protection.matchingRules : [],
      },
    };
  });

  rows.sort((a, b) => {
    const aUnavailable = Number(!a.checksAvailable) + Number(!a.classicBranchProtection.available);
    const bUnavailable = Number(!b.checksAvailable) + Number(!b.classicBranchProtection.available);
    if (bUnavailable !== aUnavailable) return bUnavailable - aUnavailable;
    if (b.missingChecks.length !== a.missingChecks.length) return b.missingChecks.length - a.missingChecks.length;
    if (b.documentation.missingChecks.length !== a.documentation.missingChecks.length) {
      return b.documentation.missingChecks.length - a.documentation.missingChecks.length;
    }
    return a.name.localeCompare(b.name);
  });

  const checkedRepositories = rows.filter((row) => row.checksAvailable).length;
  const unavailableRepositories = rows.length - checkedRepositories;
  const fileStatus = coverageStatus(rows.length, checkedRepositories, unavailableRepositories);
  const probes = probeSummary(
    rows,
    GOVERNANCE_PROBES,
    (row) => ({
      available: row.checksAvailable,
      presentChecks: row.presentChecks,
    }),
    checkedRepositories,
    unavailableRepositories,
    fileStatus,
  );

  const documentationCheckedRepositories = rows.filter((row) => row.documentation.available).length;
  const documentationUnavailableRepositories = rows.length - documentationCheckedRepositories;
  const documentationStatus = coverageStatus(
    rows.length,
    documentationCheckedRepositories,
    documentationUnavailableRepositories,
  );
  const documentationProbes = probeSummary(
    rows,
    DOCUMENTATION_PROBES,
    (row) => row.documentation,
    documentationCheckedRepositories,
    documentationUnavailableRepositories,
    documentationStatus,
  );
  const classifiedDocumentationRepositories = rows.filter(
    (row) => row.documentation.applicability?.status === "applicable",
  );
  const unclassifiedDocumentationRepositories = rows.length - classifiedDocumentationRepositories.length;
  const applicationRepositories = classifiedDocumentationRepositories.filter(
    (row) => row.documentation.applicability.componentType === "application",
  ).length;
  const serviceRepositories = classifiedDocumentationRepositories.filter(
    (row) => row.documentation.applicability.componentType === "service",
  ).length;

  const platformDeclarationObservedRows = rows.filter((row) => row.platformDeclaration?.status === "observed");
  const platformDeclarationAbsentRepositories = rows.filter((row) => row.platformDeclaration?.status === "absent").length;
  const platformDeclarationUnavailableRepositories = rows.filter((row) => row.platformDeclaration?.status === "unavailable").length;
  const platformDeclarationCheckedRepositories = rows.length - platformDeclarationUnavailableRepositories;
  const platformDeclarationStatus = coverageStatus(
    rows.length,
    platformDeclarationCheckedRepositories,
    platformDeclarationUnavailableRepositories,
  );
  const platformContract2DeclaredRepositories = platformDeclarationObservedRows.filter((row) => (
    row.platformDeclaration.declaration?.schemaVersion === "2.0"
    || row.platformDeclaration.declaration?.platformContract === "2.0"
  )).length;
  const platformApplicationRepositories = platformDeclarationObservedRows.filter(
    (row) => row.platformDeclaration.declaration?.componentType === "application",
  ).length;
  const platformServiceRepositories = platformDeclarationObservedRows.filter(
    (row) => row.platformDeclaration.declaration?.componentType === "service",
  ).length;
  const platformSharedLibraryRepositories = platformDeclarationObservedRows.filter(
    (row) => row.platformDeclaration.declaration?.componentType === "shared-library",
  ).length;

  const protectionCheckedRepositories = rows.filter((row) => row.classicBranchProtection.available).length;
  const protectionUnavailableRepositories = rows.length - protectionCheckedRepositories;
  const defaultBranchProtectedRepositories = rows.filter(
    (row) => row.classicBranchProtection.available && row.classicBranchProtection.defaultBranchProtected === true,
  ).length;
  const defaultBranchUnprotectedRepositories = Math.max(
    0,
    protectionCheckedRepositories - defaultBranchProtectedRepositories,
  );
  const protectionStatus = coverageStatus(
    rows.length,
    protectionCheckedRepositories,
    protectionUnavailableRepositories,
  );

  return {
    status: combinedCoverageStatus(fileStatus, documentationStatus, platformDeclarationStatus, protectionStatus),
    fileStatus,
    totalRepositories: rows.length,
    checkedRepositories,
    unavailableRepositories,
    repositoriesWithAllObservedFiles: rows.filter((row) => row.status === "observed").length,
    repositoriesWithObservedGaps: rows.filter((row) => row.status === "gaps").length,
    probes,
    documentation: {
      status: documentationStatus,
      scope: "policy-defined-application-service-repository-baseline-evidence",
      baselineModel: "application-service-fourteen-file-repository-baseline",
      requiredPathCount: DOCUMENTATION_PROBES.length,
      applicability: summaryApplicability(
        classifiedDocumentationRepositories.length,
        unclassifiedDocumentationRepositories,
      ),
      applicabilityModel: "platform-contract-component-type-declaration",
      applicableComponentTypes: ["application", "service"],
      classifiedRepositories: classifiedDocumentationRepositories.length,
      unclassifiedRepositories: unclassifiedDocumentationRepositories,
      applicationRepositories,
      serviceRepositories,
      applicableRepositoriesWithAllObservedFiles: classifiedDocumentationRepositories.filter(
        (row) => row.documentation.status === "observed",
      ).length,
      applicableRepositoriesWithObservedGaps: classifiedDocumentationRepositories.filter(
        (row) => row.documentation.status === "gaps",
      ).length,
      checkedRepositories: documentationCheckedRepositories,
      unavailableRepositories: documentationUnavailableRepositories,
      repositoriesWithAllObservedFiles: rows.filter((row) => row.documentation.status === "observed").length,
      repositoriesWithObservedGaps: rows.filter((row) => row.documentation.status === "gaps").length,
      probes: documentationProbes,
    },
    classicBranchProtection: {
      status: protectionStatus,
      checkedRepositories: protectionCheckedRepositories,
      protectedRepositories: defaultBranchProtectedRepositories,
      unprotectedRepositories: defaultBranchUnprotectedRepositories,
      unavailableRepositories: protectionUnavailableRepositories,
      scope: "classic-default-branch-rules",
    },
    repositories: rows,
  };
}

async function fetchGovernanceBatch(env, owner, repositories) {
  const query = buildGovernanceGraphqlQuery(owner, repositories);
  const payload = await githubRequest(env, "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!payload || (Array.isArray(payload.errors) && payload.errors.length > 0)) {
    throw new Error("GitHub GraphQL governance observation was unavailable.");
  }

  return repositories.map((repository, index) => {
    const node = payload.data?.[`r${index}`];
    if (!node || node.name !== repository.name) {
      return {
        repository: repository.name,
        available: false,
        presence: {},
        documentationApplicability: platformRoleObservation(null, false),
    platformDeclaration: platformDeclarationObservation(null, false),
        platformDeclaration: platformDeclarationObservation(null, false),
      };
    }

    return {
      repository: repository.name,
      available: true,
      presence: Object.fromEntries(
        ALL_FILE_PROBES.map((probe) => [probe.key, Boolean(node[probe.key]?.oid)]),
      ),
      documentationApplicability: platformRoleObservation(node.platformContract, true),
      platformDeclaration: platformDeclarationObservation(node.platformContract, true),
    };
  });
}

async function fetchClassicProtectionBatch(env, owner, repositories) {
  const query = buildClassicBranchProtectionGraphqlQuery(owner, repositories);
  const payload = await githubRequest(env, "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!payload || (Array.isArray(payload.errors) && payload.errors.length > 0)) {
    throw new Error("GitHub GraphQL branch-protection observation was unavailable.");
  }

  return repositories.map((repository, index) => (
    normalizeClassicProtectionNode(repository, payload.data?.[`r${index}`])
  ));
}

function unavailableFileObservations(batch) {
  return batch.map((repository) => ({
    repository: repository.name,
    available: false,
    presence: {},
    documentationApplicability: platformRoleObservation(null, false),
    platformDeclaration: platformDeclarationObservation(null, false),
  }));
}

function unavailableProtectionObservations(batch) {
  return batch.map((repository) => ({
    repository: repository.name,
    available: false,
    defaultBranchProtected: null,
    matchingRules: [],
  }));
}

export async function fetchGovernanceCoverage(env, owner, repositories, options = {}) {
  const candidates = repositories.filter((repository) => (
    repository.owner?.login?.toLowerCase() === owner.toLowerCase()
  ));
  const batchSize = boundedBatchSize(options.batchSize);
  const batches = [];

  for (let index = 0; index < candidates.length; index += batchSize) {
    batches.push(candidates.slice(index, index + batchSize));
  }

  const [fileSettled, protectionSettled] = await Promise.all([
    Promise.allSettled(batches.map((batch) => fetchGovernanceBatch(env, owner, batch))),
    Promise.allSettled(batches.map((batch) => fetchClassicProtectionBatch(env, owner, batch))),
  ]);

  const observations = [];
  const protectionObservations = [];

  fileSettled.forEach((result, index) => {
    observations.push(...(
      result.status === "fulfilled" ? result.value : unavailableFileObservations(batches[index])
    ));
  });

  protectionSettled.forEach((result, index) => {
    protectionObservations.push(...(
      result.status === "fulfilled" ? result.value : unavailableProtectionObservations(batches[index])
    ));
  });

  return buildGovernanceCoverage(candidates, observations, protectionObservations);
}
