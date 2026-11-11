import { describe, expect, it } from 'vitest';
import { markRecall, markRuling } from '../../src/domain/marking';
import type { Ruling } from '../../src/domain/types';

const expected: Ruling = {
  calls: ['FOUL', 'FREE_BALL'],
  penaltyPoints: 4,
  options: ['A', 'B'],
  cueBall: 'WHERE_IT_LIES',
};

describe('markRuling', () => {
  it('marks an identical ruling fully correct', () => {
    expect(markRuling(expected, { ...expected })).toEqual({
      calls: true, penaltyPoints: true, options: true, cueBall: true, correct: true,
    });
  });
  it('ignores call order', () => expect(markRuling(expected, { ...expected, calls: ['FREE_BALL', 'FOUL'] }).calls).toBe(true));
  it('ignores option order', () => expect(markRuling(expected, { ...expected, options: ['B', 'A'] }).options).toBe(true));
  it('fails only Options when one option is missed', () => {
    expect(markRuling(expected, { ...expected, options: ['A'] })).toEqual({
      calls: true, penaltyPoints: true, options: false, cueBall: true, correct: false,
    });
  });
  it('fails an extra option', () => expect(markRuling(expected, { ...expected, options: ['A', 'B', 'C'] }).options).toBe(false));
  it('does not double count duplicate ticks', () =>
    expect(markRuling({ ...expected, options: ['A'] }, { ...expected, options: ['A', 'A'] }).options).toBe(true));
  it('fails a missing call', () => expect(markRuling(expected, { ...expected, calls: ['FOUL'] }).correct).toBe(false));
  it('fails wrong penalty points', () => expect(markRuling(expected, { ...expected, penaltyPoints: 5 }).penaltyPoints).toBe(false));
  it('fails wrong cue-ball state', () => expect(markRuling(expected, { ...expected, cueBall: 'IN_HAND' }).cueBall).toBe(false));
});

describe('markRecall', () => {
  it('matches numbers exactly', () => {
    expect(markRecall({ type: 'number', value: 7 }, 7)).toBe(true);
    expect(markRecall({ type: 'number', value: 7 }, '7')).toBe(false);
    expect(markRecall({ type: 'number', value: 7 }, 6)).toBe(false);
  });
  it('matches choices by exact string', () => {
    const a = { type: 'choice' as const, choices: ['Pink', 'Black'], correct: 'Black' };
    expect(markRecall(a, 'Black')).toBe(true);
    expect(markRecall(a, 'black')).toBe(false);
  });
});
