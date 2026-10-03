import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isAllowedRootFile(folderName, fileName) {
  return (
    fileName === `${folderName}.jsx`
    || fileName === `${folderName}.css`
    || fileName === `${folderName}.test.jsx`
    || fileName === `${folderName}.test.js`
  );
}

/**
 * @param {string} treeRoot Absolute path to Pages/ or Components/
 * @returns {string[]} Violations as "<Folder>/<file>" paths relative to treeRoot
 */
export function collectStructureViolations(treeRoot) {
  if (!fs.existsSync(treeRoot)) {
    return [];
  }

  const violations = [];

  for (const entry of fs.readdirSync(treeRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const folderName = entry.name;
    const folderPath = path.join(treeRoot, folderName);

    for (const child of fs.readdirSync(folderPath, { withFileTypes: true })) {
      if (!child.isFile()) {
        continue;
      }
      if (!isAllowedRootFile(folderName, child.name)) {
        violations.push(`${folderName}/${child.name}`);
      }
    }
  }

  return violations.sort();
}

/**
 * @param {string[]} violations Paths relative to a Pages/ or Components/ root
 * @param {Set<string>} baselineGrandfathered Full repo-relative grandfather paths
 * @param {string} repoPrefix e.g. "src/Pages"
 */
export function findNewViolations(violations, baselineGrandfathered, repoPrefix) {
  return violations
    .map((relativePath) => `${repoPrefix}/${relativePath}`)
    .filter((fullPath) => !baselineGrandfathered.has(fullPath));
}

function loadBaseline() {
  const baselinePath = path.join(__dirname, 'pageComponentStructureBaseline.json');
  const raw = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  return new Set(raw.grandfatheredPaths);
}

export function runStructureCheck({ frontendRoot = path.resolve(__dirname, '..') } = {}) {
  const baseline = loadBaseline();
  const pagesRoot = path.join(frontendRoot, 'src/Pages');
  const componentsRoot = path.join(frontendRoot, 'src/Components');

  const newViolations = [
    ...findNewViolations(
      collectStructureViolations(pagesRoot),
      baseline,
      'src/Pages',
    ),
    ...findNewViolations(
      collectStructureViolations(componentsRoot),
      baseline,
      'src/Components',
    ),
  ].sort();

  return newViolations;
}

function main() {
  const newViolations = runStructureCheck();

  if (newViolations.length === 0) {
    return;
  }

  const lines = [
    'frontend/AGENTS.md page and component folder structure violated:',
    ...newViolations.map((v) => `  - ${v}`),
    '',
    'Each folder under src/Pages/<Name>/ or src/Components/<Name>/ may contain only',
    '<Name>.jsx, <Name>.css, and optional <Name>.test.jsx (plus asset subfolders).',
    'Move extra UI into its own Components/<Name>/ folder instead of adding another .jsx',
    'beside the page. If this is intentional legacy debt, do not expand the baseline.',
  ];

  console.error(lines.join('\n'));
  process.exit(1);
}

const isMainModule =
  process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main();
}
