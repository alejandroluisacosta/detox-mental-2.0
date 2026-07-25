import { InferenceClient } from '@huggingface/inference';
import { normalizeLlmOutput } from '../onboarding/parsers/normalizeLlmOutput.js';
import { buildTranscriptionMessages } from './buildTranscriptionMessages.js';

const DEFAULT_VISION_MODEL = 'Qwen/Qwen3-VL-30B-A3B-Instruct:novita';

/**
 * Sends a handwritten image to a Hugging Face vision-language model and returns
 * the transcribed text. The model is configurable via HF_JOURNAL_VISION_MODEL.
 * @param { { buffer: Buffer, mimeType: string } } input
 * @returns { Promise<string> } Normalized transcription (empty string if unreadable).
 */
export const transcribeJournalImage = async ({ buffer, mimeType }) => {
  const client = new InferenceClient(process.env.HF_TOKEN);
  const imageDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const model = process.env.HF_JOURNAL_VISION_MODEL || DEFAULT_VISION_MODEL;

  const response = await client.chatCompletion({
    model,
    messages: buildTranscriptionMessages(imageDataUrl),
    max_tokens: 1024,
    temperature: 0,
  });

  const raw = response.choices?.[0]?.message?.content ?? '';
  const content = typeof raw === 'string' ? raw : '';
  return normalizeLlmOutput(content);
};
