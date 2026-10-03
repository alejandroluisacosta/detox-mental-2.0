import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  chatController,
  chatControllerExpressMiddleware,
} from './onboarding.controller.js';
import { STATES } from './conversationFlow.js';

const unusedClient = {
  chatCompletion: async () => {
    throw new Error('LLM should not be called on this path');
  },
};

const mockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
};

test('FAQ hub opens in English by default and keeps Spanish when asked', async () => {
  const english = await chatController({
    message: '',
    locale: 'en',
    client: unusedClient,
  });
  assert.equal(english.state, STATES.FAQ_HUB);
  assert.match(english.reply, /Welcome to Detox Mental/);
  assert.match(english.reply, /What would you like to know now/);
  assert.equal(english.challengeChip.label, 'Go to the challenge');
  assert.match(english.challengePromptLabel, /mini-challenge/);
  assert.ok(english.faqChips.some((chip) => chip.id === 'professional_help'));
  assert.ok(
    english.faqChips.every((chip) => !/¿/.test(chip.label)),
    'English chip labels should not keep Spanish question marks',
  );

  const spanish = await chatController({
    message: '',
    locale: 'es',
    client: unusedClient,
  });
  assert.match(spanish.reply, /Bienvenido\/a a Detox Mental/);
  assert.match(spanish.reply, /¿Qué te gustaría saber ahora/);
  assert.equal(spanish.challengeChip.label, 'Ir al desafío');
  assert.ok(spanish.faqChips.some((chip) => chip.label.includes('¿Cómo se utiliza')));
});

test('FAQ chip answers stay in the requested language and Spanish wording does not drift', async () => {
  const spanish = await chatController({
    message: '',
    chipId: 'professional_help',
    locale: 'es',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.match(spanish.reply, /Detox Mental \*\*no sustituye\*\*/);
  assert.match(spanish.reply, /ayuda profesional/);
  assert.ok(!spanish.faqChips.some((chip) => chip.id === 'professional_help'));

  const english = await chatController({
    message: '',
    chipId: 'professional_help',
    locale: 'en',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.match(english.reply, /does not replace/i);
  assert.match(english.reply, /professional help/i);
  assert.doesNotMatch(english.reply, /no sustituye/);
});

test('FAQ hub rejects free text and unknown chips in the user language', async () => {
  const englishText = await chatController({
    message: 'tell me more',
    locale: 'en',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.match(englishText.reply, /choose one of the options/i);

  const spanishText = await chatController({
    message: 'cuéntame más',
    locale: 'es',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.equal(
    spanishText.reply,
    'Por favor, elige una de las opciones disponibles abajo.',
  );

  const englishChip = await chatController({
    message: '',
    chipId: 'not-a-real-chip',
    locale: 'en',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.match(englishChip.reply, /do not recognize that option/i);

  const spanishChip = await chatController({
    message: '',
    chipId: 'not-a-real-chip',
    locale: 'es',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.equal(
    spanishChip.reply,
    'No reconozco esa opción. Elige una de las tarjetas de abajo.',
  );
});

test('challenge chip opens time selection in the requested language', async () => {
  const english = await chatController({
    message: '',
    chipId: 'challenge',
    locale: 'en',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.equal(english.state, STATES.TIME_SELECTION);
  assert.match(english.reply, /2-minute or the 5-minute version/);
  assert.match(english.reply, /2 minutes/);

  const spanish = await chatController({
    message: '',
    chipId: 'challenge',
    locale: 'es',
    sessionState: { state: STATES.FAQ_HUB, data: {} },
    client: unusedClient,
  });
  assert.equal(spanish.state, STATES.TIME_SELECTION);
  assert.match(spanish.reply, /versión de 2 o 5 minutos/);
  assert.match(spanish.reply, /2 minutos/);
});

test('time selection accepts English and Spanish answers and serves the matching guide', async () => {
  const english = await chatController({
    message: 'two minutes',
    locale: 'en',
    sessionState: { state: STATES.TIME_SELECTION, data: {} },
    client: unusedClient,
  });
  assert.equal(english.state, STATES.PQA_PROMPT);
  assert.equal(english.data.timeBudget, 2);
  assert.match(english.reply, /two minutes/i);
  assert.match(english.reply, /step back/i);
  assert.match(english.ctaPrompt.title, /torment/i);
  assert.doesNotMatch(english.replyFull, /\bPQAs?\b/);
  assert.match(english.replyFull, /tormenting thoughts/i);

  const spanish = await chatController({
    message: '5 minutos',
    locale: 'es',
    sessionState: { state: STATES.TIME_SELECTION, data: {} },
    client: unusedClient,
  });
  assert.equal(spanish.data.timeBudget, 5);
  assert.match(spanish.reply, /Cinco minutos/);
  assert.match(spanish.reply, /tomar distancia/);
  assert.match(spanish.replyFull, /PQAs \(Pensamientos Que Atormentan\)/);
});

test('invalid time selection keeps the Spanish escalation and has an English counterpart', async () => {
  const spanish = await chatController({
    message: 'mañana',
    locale: 'es',
    sessionState: { state: STATES.TIME_SELECTION, data: {} },
    client: unusedClient,
  });
  assert.equal(spanish.state, STATES.TIME_SELECTION);
  assert.equal(spanish.reply, 'Por favor, responde con 2 o 5 minutos.');

  const english = await chatController({
    message: 'later',
    locale: 'en',
    sessionState: { state: STATES.TIME_SELECTION, data: {} },
    client: unusedClient,
  });
  assert.equal(english.reply, 'Please reply with 2 or 5 minutes.');
});

test('a multi-sentence PQA is rejected in the user language', async () => {
  const english = await chatController({
    message: 'I worry all the time. I also cannot sleep.',
    locale: 'en',
    sessionState: { state: STATES.PQA_PROMPT, data: { timeBudget: 2 } },
    client: unusedClient,
  });
  assert.equal(english.state, STATES.PQA_PROMPT);
  assert.match(english.reply, /single sentence/i);

  const spanish = await chatController({
    message: 'Me preocupo todo el tiempo. Tampoco duermo.',
    locale: 'es',
    sessionState: { state: STATES.PQA_PROMPT, data: { timeBudget: 2 } },
    client: unusedClient,
  });
  assert.equal(
    spanish.reply,
    'Recuerda: una sola frase. Inténtalo de nuevo.',
  );
});

test('a valid PQA asks a follow-up in the requested language via the LLM prompt', async () => {
  let seenMessages;
  const client = {
    chatCompletion: async ({ messages }) => {
      seenMessages = messages;
      return {
        choices: [{ message: { content: 'What makes that thought feel true?' } }],
      };
    },
  };

  const result = await chatController({
    message: 'I keep thinking I will fail at work.',
    locale: 'en',
    sessionState: { state: STATES.PQA_PROMPT, data: { timeBudget: 2 } },
    client,
  });

  assert.equal(result.state, STATES.PQA_EVALUATION);
  assert.match(result.reply, /What makes that thought feel true/);
  assert.match(seenMessages[0].content, /written in English/i);
  assert.equal(result.data.pqaSentence, 'I keep thinking I will fail at work.');
});

test('recommendation after evaluation is localized and leaves the user at EXIT', async () => {
  const client = {
    chatCompletion: async () => ({
      choices: [{ message: { content: '{"clarity":"high"}' } }],
    }),
  };

  const english = await chatController({
    message: 'Because my boss keeps moving the target.',
    locale: 'en',
    sessionState: {
      state: STATES.PQA_EVALUATION,
      data: { pqaSentence: 'I keep thinking I will fail at work.' },
    },
    client,
  });
  assert.equal(english.state, STATES.EXIT);
  assert.equal(english.data.pqaClarity, 'high');
  assert.match(english.reply, /clarity and concreteness/i);
  assert.match(english.reply, /decision is yours/i);

  const spanish = await chatController({
    message: 'Porque mi jefe cambia las reglas.',
    locale: 'es',
    sessionState: {
      state: STATES.PQA_EVALUATION,
      data: { pqaSentence: 'Siempre creo que voy a fallar.' },
    },
    client,
  });
  assert.match(spanish.reply, /buen nivel de claridad y concreción/);
  assert.match(spanish.reply, /la decisión es tuya/);
});

test('EXIT repeats guidance in the requested language', async () => {
  const english = await chatController({
    message: 'ok',
    locale: 'en',
    sessionState: { state: STATES.EXIT, data: { pqaClarity: 'high' } },
    client: unusedClient,
  });
  assert.match(english.reply, /theory or the test/i);

  const spanish = await chatController({
    message: 'ok',
    locale: 'es',
    sessionState: { state: STATES.EXIT, data: { pqaClarity: 'high' } },
    client: unusedClient,
  });
  assert.equal(
    spanish.reply,
    'Ya tienes orientación para seguir. Usa los botones de arriba para ir a la teoría o al test.',
  );
});

test('Express chat middleware reads locale from the body before Accept-Language', async () => {
  const req = {
    body: { message: '', locale: 'es' },
    get: () => 'en',
    headers: { 'accept-language': 'en' },
  };
  const res = mockRes();
  await chatControllerExpressMiddleware(req, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body.reply, /Bienvenido\/a a Detox Mental/);
});

test('Express chat middleware falls back to Accept-Language and then English', async () => {
  const fromHeader = mockRes();
  await chatControllerExpressMiddleware(
    {
      body: { message: '' },
      headers: { 'accept-language': 'es' },
    },
    fromHeader,
  );
  assert.match(fromHeader.body.reply, /Bienvenido\/a a Detox Mental/);

  const fromDefault = mockRes();
  await chatControllerExpressMiddleware({ body: { message: '' }, headers: {} }, fromDefault);
  assert.match(fromDefault.body.reply, /Welcome to Detox Mental/);
});
