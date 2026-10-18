import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryRateLimitDb } from '../rateLimit/rateLimit.testDb.js';
import { buildRecommendationReply } from './parsers/buildRecommendationReply.js';

process.env.MAGIC_LINK_SECRET = 'test-secret';
const {
  chatController,
  chatControllerExpressMiddleware,
  FALLBACK_CHALLENGE,
} = await import('./onboarding.controller.js');
const { default: vercelChatHandler } = await import('../../api/chat.js');

const SENTENCE = 'Nunca hago nada bien.';
const MODEL_CHALLENGE = '¿Qué te lleva a pensar eso ahora mismo?';

let llmCalls;

const forbiddenClient = {
  chatCompletion: async () => {
    llmCalls += 1;
    throw new Error('LLM must not be called');
  },
};

// Answers the challenge with a question and the evaluation with JSON.
const modelClient = {
  chatCompletion: async ({ max_tokens: maxTokens }) => {
    llmCalls += 1;
    const content = maxTokens === 150 ? MODEL_CHALLENGE : '{"clarity":"high"}';
    return { choices: [{ message: { content } }] };
  },
};

const challengeState = (pqaSentence = SENTENCE) => ({
  state: 'PQA_CHALLENGE',
  data: { pqaSentence },
});

const evaluationState = (pqaSentence = SENTENCE) => ({
  state: 'PQA_EVALUATION',
  data: { pqaSentence, pqaChallenge: 'x' },
});

const run = (sessionState, overrides = {}) =>
  chatController({
    message: '',
    sessionState,
    client: forbiddenClient,
    allowLlmCall: async () => true,
    ...overrides,
  });

beforeEach(() => {
  llmCalls = 0;
});

test('forged oversized pqaSentence resets to PQA_PROMPT without an LLM call', async () => {
  const result = await run(challengeState('a'.repeat(5000)));
  assert.equal(result.state, 'PQA_PROMPT');
  assert.equal(llmCalls, 0);
});

test('forged multi-sentence pqaSentence resets to PQA_PROMPT', async () => {
  const result = await run(challengeState('Una frase. Otra frase.'));
  assert.equal(result.state, 'PQA_PROMPT');
  assert.equal(llmCalls, 0);
});

test('forged non-string pqaSentence at the evaluation step resets to PQA_PROMPT', async () => {
  const result = await run(evaluationState({ big: 'object' }));
  assert.equal(result.state, 'PQA_PROMPT');
  assert.equal(llmCalls, 0);
});

test('typing an oversized sentence in the UI path is rejected without an LLM call', async () => {
  const result = await run(
    { state: 'PQA_PROMPT', data: {} },
    { message: 'a'.repeat(301) },
  );
  assert.equal(result.state, 'PQA_PROMPT');
  assert.equal(llmCalls, 0);
});

test('challenge step, call denied: canned challenge and onboarding advances', async () => {
  const result = await run(challengeState(), { allowLlmCall: async () => false });
  assert.equal(result.reply, FALLBACK_CHALLENGE);
  assert.equal(result.state, 'PQA_EVALUATION');
  assert.equal(llmCalls, 0);
});

test('evaluation step, call denied: medium recommendation without an LLM call', async () => {
  const result = await run(evaluationState(), { allowLlmCall: async () => false });
  assert.equal(result.reply, buildRecommendationReply('medium'));
  assert.equal(llmCalls, 0);
});

test('no allowLlmCall passed: behaves as denied', async () => {
  const result = await chatController({
    message: '',
    sessionState: challengeState(),
    client: forbiddenClient,
  });
  assert.equal(result.reply, FALLBACK_CHALLENGE);
  assert.equal(llmCalls, 0);
});

test('call allowed: the model output is used', async () => {
  const challenge = await run(challengeState(), { client: modelClient });
  assert.equal(challenge.reply, MODEL_CHALLENGE);
  assert.equal(challenge.state, 'PQA_EVALUATION');

  const evaluation = await run(evaluationState(), { client: modelClient });
  assert.equal(evaluation.reply, buildRecommendationReply('high'));
  assert.equal(llmCalls, 2);
});

test('a database error while checking the limit falls back instead of calling the LLM', async () => {
  const db = {
    query: async () => {
      throw new Error('db down');
    },
  };
  const res = mockRes();
  await chatControllerExpressMiddleware(
    expressReq({ db, sessionState: challengeState() }),
    res,
  );
  assert.equal(res.body.reply, FALLBACK_CHALLENGE);
  assert.equal(llmCalls, 0);
});

const mockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
    setHeader(name, value) {
      res.headers[name] = value;
    },
  };
  return res;
};

const expressReq = ({ db, ip = '1.1.1.1', sessionState, now }) => ({
  method: 'POST',
  body: { message: '', sessionState },
  headers: {},
  socket: { remoteAddress: ip },
  db,
  now,
  llmClient: modelClient,
});

for (const [name, entrypoint] of [
  ['Express route', chatControllerExpressMiddleware],
  ['Vercel handler', vercelChatHandler],
]) {
  test(`${name}: the 7th call from one IP in an hour gets the fallback`, async () => {
    const db = memoryRateLimitDb();
    const replies = [];
    for (let i = 0; i < 7; i += 1) {
      const res = mockRes();
      await entrypoint(expressReq({ db, sessionState: challengeState() }), res);
      assert.equal(res.statusCode, 200);
      replies.push(res.body.reply);
    }
    assert.deepEqual(replies.slice(0, 6), Array(6).fill(MODEL_CHALLENGE));
    assert.equal(replies[6], FALLBACK_CHALLENGE);
    assert.equal(llmCalls, 6);
  });

  test(`${name}: a different IP is not affected by an exhausted one`, async () => {
    const db = memoryRateLimitDb();
    for (let i = 0; i < 7; i += 1) {
      await entrypoint(expressReq({ db, sessionState: challengeState() }), mockRes());
    }
    const res = mockRes();
    await entrypoint(
      expressReq({ db, ip: '2.2.2.2', sessionState: challengeState() }),
      res,
    );
    assert.equal(res.body.reply, MODEL_CHALLENGE);
  });
}
