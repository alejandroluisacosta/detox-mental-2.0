export const TRANSCRIPTION_PROMPT = `Transcribe the handwritten text in this image exactly as it is written.
The text may be in Spanish or English: transcribe it verbatim in its original language and do not translate it.
Preserve the original line breaks and paragraphs.
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
