import codes from "./codes.json";
import { getSessions, getTests, getTheory } from "./content/index.js";

const sessionsData = getSessions();
const thoughtsTests = getTests();

export { sessionsData, codes, thoughtsTests, getSessions, getTests, getTheory };
