import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  collectStructureViolations,
  findNewViolations,
  findStaleGrandfatheredPaths,
} from './checkPageComponentStructure.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function writePageFolder(root, folderName, files) {
  const dir = path.join(root, folderName);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), contents);
  }
}

describe('collectStructureViolations', () => {
  it('accepts the canonical page folder layout and asset subfolders', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-structure-'));
    writePageFolder(root, 'JournalMeditations', {
      'JournalMeditations.jsx': 'export default function JournalMeditations() {}',
      'JournalMeditations.css': '.x {}',
      'JournalMeditations.test.jsx': 'test',
    });
    fs.mkdirSync(path.join(root, 'JournalMeditations', 'unblockAnimation'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(root, 'JournalMeditations', 'unblockAnimation', 'anim.json'),
      '{}',
    );

    expect(collectStructureViolations(root)).toEqual([]);
  });

  it('flags a second page-level jsx beside the named page component', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-structure-'));
    writePageFolder(root, 'JournalMeditations', {
      'JournalMeditations.jsx': 'export default function JournalMeditations() {}',
      'MeditationProgressControl.jsx':
        'export default function MeditationProgressControl() {}',
    });

    expect(collectStructureViolations(root)).toEqual([
      'JournalMeditations/MeditationProgressControl.jsx',
    ]);
  });

  it('flags disallowed root files in component folders', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-structure-'));
    writePageFolder(root, 'SessionCard', {
      'SessionCard.jsx': 'export default function SessionCard() {}',
      'helpers.js': 'export const x = 1;',
    });

    expect(collectStructureViolations(root)).toEqual(['SessionCard/helpers.js']);
  });
});

describe('findNewViolations', () => {
  it('allows grandfathered legacy paths but rejects new ones', () => {
    const violations = [
      'Course/CourseWrapper.jsx',
      'JournalMeditations/MeditationProgressControl.jsx',
    ];
    const baseline = new Set(['src/Pages/Course/CourseWrapper.jsx']);

    expect(
      findNewViolations(violations, baseline, 'src/Pages'),
    ).toEqual(['src/Pages/JournalMeditations/MeditationProgressControl.jsx']);
  });
});

describe('findStaleGrandfatheredPaths', () => {
  it('requires shrinking the baseline when legacy layout is fixed', () => {
    const baseline = new Set([
      'src/Pages/Course/CourseWrapper.jsx',
      'src/Pages/Promo/PromoGate.jsx',
    ]);

    expect(
      findStaleGrandfatheredPaths(['Course/CourseWrapper.jsx'], [], baseline),
    ).toEqual(['src/Pages/Promo/PromoGate.jsx']);
  });
});

describe('repo baseline', () => {
  it('matches the committed grandfather list for current Pages/Components', () => {
    const frontendRoot = path.resolve(__dirname, '..');
    const pagesRoot = path.join(frontendRoot, 'src/Pages');
    const componentsRoot = path.join(frontendRoot, 'src/Components');
    const baselinePath = path.join(
      __dirname,
      'pageComponentStructureBaseline.json',
    );
    const baseline = new Set(
      JSON.parse(fs.readFileSync(baselinePath, 'utf8')).grandfatheredPaths,
    );

    const pageViolations = collectStructureViolations(pagesRoot);
    const componentViolations = collectStructureViolations(componentsRoot);

    expect(
      findNewViolations(pageViolations, baseline, 'src/Pages'),
    ).toEqual([]);
    expect(
      findNewViolations(componentViolations, baseline, 'src/Components'),
    ).toEqual([]);
    expect(
      findStaleGrandfatheredPaths(
        pageViolations,
        componentViolations,
        baseline,
      ),
    ).toEqual([]);
  });

  it('documents that the baseline is legacy violations only, not a page list', () => {
    const baselinePath = path.join(
      __dirname,
      'pageComponentStructureBaseline.json',
    );
    const { policy, grandfatheredPaths } = JSON.parse(
      fs.readFileSync(baselinePath, 'utf8'),
    );

    expect(policy).toMatch(/not an inventory/i);
    expect(policy).toMatch(/never add/i);
    expect(grandfatheredPaths).not.toContain('src/Pages/Journal/Journal.jsx');
  });
});
