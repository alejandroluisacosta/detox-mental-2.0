import { interpolate, parseLocale } from './locale.js';

const messages = {
  en: {
    topicsMustBeList: 'Topics must be sent as a list.',
    tooManyTopics: 'You can select up to {max} topics per entry.',
    invalidTopic: 'One or more topics are not valid.',
    duplicateTopic: 'You cannot repeat the same topic.',
    entriesLoadFailed: 'Error loading the journal.',
    emptyContent: 'Journal text cannot be empty.',
    contentTooLong: 'Entries can have up to {max} characters.',
    saveFailed: 'Could not save the entry.',
    invalidEntryId: 'Invalid entry identifier.',
    entryNotFound: 'Entry not found.',
    deleteFailed: 'Could not delete the entry.',
    topicsUpdateFailed: 'Could not update the topics.',
    topicNameRequired: 'Enter a topic name.',
    topicNameTooLong: 'Topic names can have up to {max} characters.',
    topicNameReserved: 'That name is already used by a built-in topic.',
    topicNameDuplicate: 'You already have a topic with that name.',
    tooManyCustomTopics: 'You can create up to {max} custom topics.',
    customTopicNotFound: 'Topic not found.',
    topicCreateFailed: 'Could not create the topic.',
    topicRenameFailed: 'Could not rename the topic.',
    topicsLoadFailed: 'Could not load your topics.',
    imageTooLarge: 'The image is too large (maximum 3 MB).',
    imageProcessFailed: 'Could not process the image.',
    imageUnreadable: 'Could not read the text from the image.',
    transcribeFailed: 'Could not transcribe the image.',
    transcribeRateLimited: "You've reached today's transcription limit. Try again tomorrow.",
    missingImage: 'No image was received.',
    unsupportedImageFormat: 'Unsupported image format. Use JPG, PNG, or WebP.',
    invalidImage: 'The file does not appear to be a valid image.',
    summaryLoadFailed: 'Error loading the summary.',
    needEntries:
      'You need at least {minEntries} entries in the last 7 days to create the summary.',
    summaryServiceUnconfigured: 'The summary service is not configured.',
    summaryGenerateFailed:
      'Could not generate the summary. Try again in a few moments.',
    summaryCreateFailed: 'Error creating the summary.',
    summaryQuotaExhausted:
      'You have used both summaries this week. New ones are available on Monday.',
    summaryFeedbackExhausted:
      'You have already sent comments on this summary.',
    summaryNotFound: 'There is no summary to revise this week.',
    summaryInvalidComments: 'Comments are missing or not valid.',
    summaryReviseFailed: 'Could not revise the summary.',
    summaryTimeout: 'The summary took too long to generate.',
    summaryTryLater: 'Please try later. Wait a few minutes and try again.',
    firstReflectionTooShort: 'Write at least {min} characters to get a first reflection.',
    firstReflectionTooLong: 'A first reflection accepts up to {max} characters.',
    firstReflectionLimited:
      "Today's free reflections are used up. Create an account to keep journaling and get your weekly summary.",
    firstReflectionUnavailable: 'First reflections are not available right now.',
    firstReflectionFailed: 'Could not write the reflection. Try again in a few moments.',
    frontMatterInvalid: 'Front matter must be text.',
    frontMatterNothingToSave: 'Nothing to save.',
    frontMatterLoadFailed: 'Could not load the front matter.',
    frontMatterSaveFailed: 'Could not save the front matter.',
  },
  es: {
    topicsMustBeList: 'Los temas deben enviarse como una lista.',
    tooManyTopics: 'Puedes seleccionar hasta {max} temas por entrada.',
    invalidTopic: 'Uno o más temas no son válidos.',
    duplicateTopic: 'No puedes repetir el mismo tema.',
    entriesLoadFailed: 'Error al cargar el diario.',
    emptyContent: 'El texto del diario no puede estar vacío.',
    contentTooLong: 'Las entradas pueden tener hasta {max} caracteres.',
    saveFailed: 'No se pudo guardar la entrada.',
    invalidEntryId: 'Identificador de entrada no válido.',
    entryNotFound: 'Entrada no encontrada.',
    deleteFailed: 'No se pudo eliminar la entrada.',
    topicsUpdateFailed: 'No se pudieron actualizar los temas.',
    topicNameRequired: 'Escribe el nombre del tema.',
    topicNameTooLong: 'Los nombres de tema pueden tener hasta {max} caracteres.',
    topicNameReserved: 'Ese nombre ya lo usa un tema predefinido.',
    topicNameDuplicate: 'Ya tienes un tema con ese nombre.',
    tooManyCustomTopics: 'Puedes crear hasta {max} temas personalizados.',
    customTopicNotFound: 'Tema no encontrado.',
    topicCreateFailed: 'No se pudo crear el tema.',
    topicRenameFailed: 'No se pudo cambiar el nombre del tema.',
    topicsLoadFailed: 'No se pudieron cargar tus temas.',
    imageTooLarge: 'La imagen es demasiado grande (máximo 3 MB).',
    imageProcessFailed: 'No se pudo procesar la imagen.',
    imageUnreadable: 'No se pudo leer el texto de la imagen.',
    transcribeFailed: 'No se pudo transcribir la imagen.',
    transcribeRateLimited:
      'Has alcanzado el límite de transcripciones de hoy. Inténtalo de nuevo mañana.',
    missingImage: 'No se recibió ninguna imagen.',
    unsupportedImageFormat:
      'Formato de imagen no admitido. Usa JPG, PNG o WebP.',
    invalidImage: 'El archivo no parece ser una imagen válida.',
    summaryLoadFailed: 'Error al cargar el resumen.',
    needEntries:
      'Necesitas al menos {minEntries} entradas en los últimos 7 días para crear el resumen.',
    summaryServiceUnconfigured: 'El servicio de resumen no está configurado.',
    summaryGenerateFailed:
      'No se pudo generar el resumen. Inténtalo de nuevo en unos momentos.',
    summaryCreateFailed: 'Error al crear el resumen.',
    summaryQuotaExhausted:
      'Ya has usado los dos resúmenes de esta semana. Podrás generar más el lunes.',
    summaryFeedbackExhausted:
      'Ya has enviado comentarios sobre este resumen.',
    summaryNotFound: 'No hay un resumen que revisar esta semana.',
    summaryInvalidComments: 'Faltan comentarios o no son válidos.',
    summaryReviseFailed: 'No se pudo revisar el resumen.',
    summaryTimeout: 'El resumen tardó demasiado en generarse.',
    summaryTryLater: 'Inténtalo más tarde. Espera unos minutos y vuelve a intentarlo.',
    firstReflectionTooShort: 'Escribe al menos {min} caracteres para recibir una primera reflexión.',
    firstReflectionTooLong: 'Una primera reflexión admite hasta {max} caracteres.',
    firstReflectionLimited:
      'Las reflexiones gratuitas de hoy se han agotado. Crea una cuenta para seguir escribiendo y recibir tu resumen semanal.',
    firstReflectionUnavailable: 'Las primeras reflexiones no están disponibles ahora mismo.',
    firstReflectionFailed: 'No se pudo escribir la reflexión. Inténtalo de nuevo en unos momentos.',
    frontMatterInvalid: 'El texto de portada debe ser texto.',
    frontMatterNothingToSave: 'No hay nada que guardar.',
    frontMatterLoadFailed: 'No se pudo cargar el texto de portada.',
    frontMatterSaveFailed: 'No se pudo guardar el texto de portada.',
  },
};

export const messageCatalogs = messages;

export const journalMessage = (locale, key, values) => {
  const resolved = parseLocale(locale);
  const template =
    messageCatalogs[resolved]?.[key] || messageCatalogs.en[key] || key;
  return interpolate(template, values);
};
