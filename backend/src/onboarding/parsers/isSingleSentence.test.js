import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSingleSentence } from './isSingleSentence.js'

test('returns true for a single sentence', () => {
  assert.equal(isSingleSentence('This is one sentence.'), true)
})

test('returns false for multiple sentences', () => {
  assert.equal(isSingleSentence('One sentence. Two sentences!'), false)
})

test('returns false for empty input', () => {
  assert.equal(isSingleSentence('   '), false)
})
