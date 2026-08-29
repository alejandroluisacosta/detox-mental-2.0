import multer from 'multer';
import { validateTranscriptionInput, MAX_IMAGE_BYTES } from './validateTranscriptionInput.js';
import { transcribeJournalImage } from './journalTranscription.service.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

/**
 * Parses a single in-memory `image` file and converts multer errors
 * (e.g. oversized upload) into the JSON error shape used across the API.
 */
export const uploadJournalImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const locale = localeFromRequest(req);
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? journalMessage(locale, 'imageTooLarge')
          : journalMessage(locale, 'imageProcessFailed');
      return res.status(400).json({ message });
    }
    return next();
  });
};

export const postJournalTranscription = async (req, res) => {
  const locale = localeFromRequest(req);
  const validation = validateTranscriptionInput(req.file, locale);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const text = await transcribeJournalImage({
      buffer: req.file.buffer,
      mimeType: validation.mimeType,
    });

    if (!text) {
      return res.status(422).json({ message: journalMessage(locale, 'imageUnreadable') });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('[journal-transcription POST]', err);
    return res.status(502).json({ message: journalMessage(locale, 'transcribeFailed') });
  }
};
