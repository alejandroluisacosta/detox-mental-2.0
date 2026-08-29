import { interpolate, parseLocale } from './locale.js';

const messages = {
  en: {
    topicsMustBeList: 'Topics must be sent as a list.',
    tooManyTopics: 'You can select up to {max} topics per entry.',
    invalidTopic: 'One or more topics are not valid.',
    duplicateTopic: 'You cannot repeat the same topic.',
    entriesLoadFailed: 'Error loading the journal.',
    emptyContent: 'Journal text cannot be empty.',
    saveFailed: 'Could not save the entry.',
    invalidEntryId: 'Invalid entry identifier.',
    entryNotFound: 'Entry not found.',
    deleteFailed: 'Could not delete the entry.',
    topicsUpdateFailed: 'Could not update the topics.',
    imageTooLarge: 'The image is too large (maximum 3 MB).',
    imageProcessFailed: 'Could not process the image.',
    imageUnreadable: 'Could not read the text from the image.',
    transcribeFailed: 'Could not transcribe the image.',
    missingImage: 'No image was received.',
    unsupportedImageFormat: 'Unsupported image format. Use JPG, PNG, or WebP.',
    invalidImage: 'The file does not appear to be a valid image.',
    summaryLoadFailed: 'Error loading the summary.',
    needEntries:
      'You need at least {minEntries} entries this week to create the summary.',
    summaryServiceUnconfigured: 'The summary service is not configured.',
    summaryGenerateFailed:
      'Could not generate the summary. Try again in a few moments.',
    summaryCreateFailed: 'Error creating the summary.',
  },
  es: {
    topicsMustBeList: 'Los temas deben enviarse como una lista.',
    tooManyTopics: 'Puedes seleccionar hasta {max} temas por entrada.',
    invalidTopic: 'Uno o más temas no son válidos.',
    duplicateTopic: 'No puedes repetir el mismo tema.',
    entriesLoadFailed: 'Error al cargar el diario.',
    emptyContent: 'El texto del diario no puede estar vacío.',
    saveFailed: 'No se pudo guardar la entrada.',
    invalidEntryId: 'Identificador de entrada no válido.',
    entryNotFound: 'Entrada no encontrada.',
    deleteFailed: 'No se pudo eliminar la entrada.',
    topicsUpdateFailed: 'No se pudieron actualizar los temas.',
    imageTooLarge: 'La imagen es demasiado grande (máximo 3 MB).',
    imageProcessFailed: 'No se pudo procesar la imagen.',
    imageUnreadable: 'No se pudo leer el texto de la imagen.',
    transcribeFailed: 'No se pudo transcribir la imagen.',
    missingImage: 'No se recibió ninguna imagen.',
    unsupportedImageFormat:
      'Formato de imagen no admitido. Usa JPG, PNG o WebP.',
    invalidImage: 'El archivo no parece ser una imagen válida.',
    summaryLoadFailed: 'Error al cargar el resumen.',
    needEntries:
      'Necesitas al menos {minEntries} entradas esta semana para crear el resumen.',
    summaryServiceUnconfigured: 'El servicio de resumen no está configurado.',
    summaryGenerateFailed:
      'No se pudo generar el resumen. Inténtalo de nuevo en unos momentos.',
    summaryCreateFailed: 'Error al crear el resumen.',
  },
};

export const messageCatalogs = messages;

export const journalMessage = (locale, key, values) => {
  const resolved = parseLocale(locale);
  const template =
    messageCatalogs[resolved]?.[key] || messageCatalogs.en[key] || key;
  return interpolate(template, values);
};
