import fs from "node:fs";

const requiredApplicationServiceFiles = [
  "README.md",
  "SPECIFICATIONS.md",
  "FEATURES.md",
  "IMPLEMENTED-FEATURES.md",
  "PLANNED-FEATURES.md",
  "CHANGELOGS.md",
  "BENEFITS.md",
  "COMPETITIVE-OBJECTIVES.md",
  "BRANDING.md",
  "USER-MANUAL.md",
  "PRIVACY POLICY.md",
  "NOTES.md",
  "SECURITY.md",
  ".gitignore",
];

const failures = [];

for (const file of requiredApplicationServiceFiles) {
  if (!fs.existsSync(file)) failures.push(`Missing mandatory application/service repository file: ${file}`);
}

for (const retired of ["FEATURE-ROADMAP.md", "CHANGELOG.md"]) {
  if (fs.existsSync(retired)) failures.push(`Retired duplicate repository authority must be removed: ${retired}`);
}

if (fs.existsSync("README.md")) {
  const readme = fs.readFileSync("README.md", "utf8");
  for (const file of requiredApplicationServiceFiles.filter((file) => !["README.md", ".gitignore"].includes(file))) {
    const encoded = file.replaceAll(" ", "%20");
    if (!readme.includes(`](${encoded})`) && !readme.includes(`](${file})`)) {
      failures.push(`README must link ${file}`);
    }
  }
}

if (failures.length) {
  console.error("Repository-policy documentation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Repository-policy documentation validation passed.");
