import multer from 'multer';
import { validateTranscriptionInput, MAX_IMAGE_BYTES } from './validateTranscriptionInput.js';
import { transcribeJournalImage } from './journalTranscription.service.js';

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
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen es demasiado grande (máximo 3 MB).'
          : 'No se pudo procesar la imagen.';
      return res.status(400).json({ message });
    }
    return next();
  });
};

export const postJournalTranscription = async (req, res) => {
  const validation = validateTranscriptionInput(req.file);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const text = await transcribeJournalImage({
      buffer: req.file.buffer,
      mimeType: validation.mimeType,
    });

    if (!text) {
      return res.status(422).json({ message: 'No se pudo leer el texto de la imagen.' });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('[journal-transcription POST]', err);
    return res.status(502).json({ message: 'No se pudo transcribir la imagen.' });
  }
};
