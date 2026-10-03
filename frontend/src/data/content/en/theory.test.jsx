import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { getTheory } from '../index.js';

describe('English theory article', () => {
  test('renders the English article without leftover Spanish product terms', () => {
    const { Body, WantMore, writtenBy } = getTheory('en');
    const { container } = render(
      <>
        <Body writtenBy={writtenBy} />
        <WantMore />
      </>,
    );
    const text = container.textContent;

    expect(text).toMatch(/tormenting thoughts/i);
    expect(text).toMatch(/If you consider yourself a sensitive person/i);
    expect(text).toMatch(/15 audio sessions/);
    expect(text).toMatch(/15 writing activities/);
    expect(text).toMatch(/the most recommended thing is that you go to therapy/i);
    expect(text).toMatch(/Step back/);
    expect(text).toMatch(/Arm yourself/);
    expect(text).toMatch(/stillness/i);

    expect(text).not.toMatch(/\bPQA/);
    expect(text).not.toMatch(/Toma distancia/);
    expect(text).not.toMatch(/Ármate/);
    expect(text).not.toMatch(/Cómo limpiar tu mente/);
    expect(text).not.toMatch(/Pensamientos Que Atormentan/);
    expect(text).not.toMatch(/¿Quieres más\?/);
  });

  test('Spanish theory body still contains the original Spanish wording', () => {
    const { Body, writtenBy } = getTheory('es');
    const { container } = render(<Body writtenBy={writtenBy} />);
    const text = container.textContent;

    expect(text).toMatch(/PQAs \(Pensamientos Que Atormentan\)/);
    expect(text).toMatch(/Toma distancia/);
    expect(text).toMatch(/si te consideras una persona sensible/i);
  });
});
