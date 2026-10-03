import { getTests } from './content/index.js';

// Compatibility shim. Prefer getTests(locale) from data/content.
export const thoughtsTests = getTests();
