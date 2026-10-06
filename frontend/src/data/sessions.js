import { getSessions } from './content/index.js';

// Compatibility shim. Prefer getSessions(locale) from data/content.
const sessionsData = getSessions();

export default sessionsData;
