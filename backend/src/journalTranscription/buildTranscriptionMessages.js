export const TRANSCRIPTION_PROMPT = `Transcribe the handwritten text in this image exactly as it is written.
The text may be in Spanish or English: transcribe it verbatim in its original language and do not translate it.
Treat consecutive handwritten lines as a continuous paragraph: join them with spaces and do not insert a line break where the writer simply ran out of space.
If a word is hyphenated across lines (e.g. "bed-" on one line and "room" on the next), join them into a single word without the hyphen or a line break (e.g. "bedroom").
Only insert a paragraph break when there is a clearly blank line between blocks of text. Represent each intentional paragraph break as a double line break (\\n\\n).
Do not preserve soft wrapping within a paragraph.
Do not summarize, correct spelling, rephrase, or add any commentary.
If a word or section is illegible, write [ilegible] in its place.
Respond only with the transcribed text.`;

/**
 * Builds the multimodal chat message (text instruction + image) for the vision model.
 * @param { string } imageDataUrl - Base64 data URL, e.g. "data:image/png;base64,...".
 * @returns { Array<{ role: string, content: Array<object> }> }
 */
export const buildTranscriptionMessages = (imageDataUrl) => [
  {
    role: 'user',
    content: [
      { type: 'text', text: TRANSCRIPTION_PROMPT },
      { type: 'image_url', image_url: { url: imageDataUrl } },
    ],
  },
];
