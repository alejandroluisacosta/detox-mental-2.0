import { getTestExtras } from '../../data/content/index.js';

const extras = getTestExtras('es');

export const loadingQuotes = extras.loadingQuotes;
export const journalAcknowledgments = extras.journalAcknowledgments;

export const getRandomLoadingQuote = () =>
  loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];

export const getRandomJournalAcknowledgment = () =>
  journalAcknowledgments[Math.floor(Math.random() * journalAcknowledgments.length)];
