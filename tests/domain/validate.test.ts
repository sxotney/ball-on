import { describe, expect, it } from 'vitest';
import { validateOptionsList, validateQuestion } from '../../src/domain/validate';
import { judgement, OPTION_IDS, recall, scenario, TOPICS } from '../fixtures/questions';

const v = (q: unknown) => validateQuestion(q, OPTION_IDS, TOPICS);
const expectError = (q: unknown, field: string) => {
  const errors = v(q);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.join('\n')).toContain(field);
};

describe('validateQuestion', () => {
  it('accepts a valid scenario, recall and judgement call', () => {
    expect(v(scenario())).toEqual([]);
    expect(v(recall())).toEqual([]);
    expect(v(recall({ answer: { type: 'choice', choices: ['Pink', 'Black'], correct: 'Black' } }))).toEqual([]);
    expect(v(judgement())).toEqual([]);
  });

  it('prefixes messages with the question id', () => {
    expect(v(scenario({ citations: [] }))[0]).toMatch(/^fam-001/);
  });

  it('rejects an unknown kind', () => expectError({ ...scenario(), kind: 'quiz' }, 'kind'));
  it('rejects a bad citation', () => expectError(scenario({ citations: ['S3 R99'] }), 'citations'));
  it('rejects empty citations', () => expectError(scenario({ citations: [] }), 'citations'));
  it('rejects another edition', () => expectError({ ...scenario(), edition: '2023-01' }, 'edition'));
  it('rejects an unknown topic', () => expectError(scenario({ topic: 'nope' }), 'topic'));
  it('rejects an unknown option id', () =>
    expectError(scenario({ ruling: { ...scenario().ruling, options: ['MADE_UP'] } }), 'options'));
  it('rejects a duplicate call', () =>
    expectError(scenario({ ruling: { ...scenario().ruling, calls: ['FOUL', 'FOUL'] } }), 'calls'));
  it('rejects an empty call list', () =>
    expectError(scenario({ ruling: { ...scenario().ruling, calls: [] } }), 'calls'));
  it('rejects penalty points of 3', () =>
    expectError({ ...scenario(), ruling: { ...scenario().ruling, penaltyPoints: 3 } }, 'penaltyPoints'));
  it('rejects NO_FOUL combined with another call', () =>
    expectError(scenario({ ruling: { ...scenario().ruling, calls: ['NO_FOUL', 'FOUL'], penaltyPoints: 0 } }), 'NO_FOUL'));
  it('rejects NO_FOUL with penalty points', () =>
    expectError(scenario({ ruling: { ...scenario().ruling, calls: ['NO_FOUL'], penaltyPoints: 4 } }), 'penaltyPoints'));
  it('rejects a choice answer whose correct value is not a choice', () =>
    expectError(recall({ answer: { type: 'choice', choices: ['Pink'], correct: 'Black' } }), 'answer'));
  it('rejects a diagram ball off the playing area', () =>
    expectError(scenario({ diagram: { balls: [{ ball: 'red', x: 1800, y: 100 }] } }), 'diagram'));
  it('rejects two white balls', () =>
    expectError(
      scenario({ diagram: { balls: [{ ball: 'white', x: 100, y: 100 }, { ball: 'white', x: 200, y: 200 }] } }),
      'white',
    ));
  it('rejects a non-object', () => expect(v('hello').length).toBeGreaterThan(0));
});

describe('validateOptionsList', () => {
  it('accepts a valid list', () =>
    expect(validateOptionsList([{ id: 'A', label: 'Play on', citation: 'S3 R10(f)' }])).toEqual([]));
  it('rejects duplicate ids and bad citations', () => {
    const errors = validateOptionsList([
      { id: 'A', label: 'x', citation: 'S3 R10(f)' },
      { id: 'A', label: 'y', citation: 'S9 R1' },
    ]);
    expect(errors.join('\n')).toContain('duplicate');
    expect(errors.join('\n')).toContain('citation');
  });
});

describe('diagram view', () => {
  it('accepts top, bottom and full', () => {
    for (const view of ['top', 'bottom', 'full'] as const) {
      expect(validateQuestion(scenario({ diagram: { balls: [], view } }), OPTION_IDS, TOPICS)).toEqual([]);
    }
  });
  it('rejects an unknown view', () =>
    expect(validateQuestion({ ...scenario(), diagram: { balls: [], view: 'left' } }, OPTION_IDS, TOPICS).join()).toContain('view'));
});

describe('FOUL vs FOUL AND A MISS', () => {
  it('rejects both in one Ruling', () =>
    expect(validateQuestion(scenario({ ruling: { ...scenario().ruling, calls: ['FOUL', 'FOUL_AND_A_MISS'] } }), OPTION_IDS, TOPICS).join())
      .toContain('FOUL_AND_A_MISS'));
});
