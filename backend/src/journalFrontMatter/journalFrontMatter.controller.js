import pool from '../db/db.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';
import {
  getMeditationFrontMatterForUser,
  patchMeditationFrontMatterForUser,
} from './journalFrontMatter.service.js';

const dbFor = (req) => req.db ?? pool;

export const getMeditationFrontMatter = async (req, res) => {
  const locale = localeFromRequest(req);

  try {
    const frontMatter = await getMeditationFrontMatterForUser(req.user.id, dbFor(req));
    return res.status(200).json({ frontMatter });
  } catch (err) {
    console.error('[journal-front-matter GET]', err);
    return res.status(500).json({
      message: journalMessage(locale, 'frontMatterLoadFailed'),
    });
  }
};

export const patchMeditationFrontMatter = async (req, res) => {
  const locale = localeFromRequest(req);
  const body = req.body;

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      message: journalMessage(locale, 'frontMatterInvalid'),
    });
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
  const hasAuthorName = Object.prototype.hasOwnProperty.call(body, 'authorName');
  const hasIntroduction = Object.prototype.hasOwnProperty.call(body, 'introduction');

  if (!hasTitle && !hasAuthorName && !hasIntroduction) {
    return res.status(400).json({
      message: journalMessage(locale, 'frontMatterNothingToSave'),
    });
  }

  if (hasTitle && typeof body.title !== 'string') {
    return res.status(400).json({
      message: journalMessage(locale, 'frontMatterInvalid'),
    });
  }
  if (hasAuthorName && typeof body.authorName !== 'string') {
    return res.status(400).json({
      message: journalMessage(locale, 'frontMatterInvalid'),
    });
  }
  if (hasIntroduction && typeof body.introduction !== 'string') {
    return res.status(400).json({
      message: journalMessage(locale, 'frontMatterInvalid'),
    });
  }

  try {
    const frontMatter = await patchMeditationFrontMatterForUser(
      req.user.id,
      {
        title: hasTitle ? body.title.trim() : '',
        authorName: hasAuthorName ? body.authorName.trim() : '',
        introduction: hasIntroduction ? body.introduction.trim() : '',
        setTitle: hasTitle,
        setAuthorName: hasAuthorName,
        setIntroduction: hasIntroduction,
      },
      dbFor(req),
    );
    return res.status(200).json({ frontMatter });
  } catch (err) {
    console.error('[journal-front-matter PATCH]', err);
    return res.status(500).json({
      message: journalMessage(locale, 'frontMatterSaveFailed'),
    });
  }
};
