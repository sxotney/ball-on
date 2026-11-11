import { describe, expect, it } from 'vitest';
import { RELEARN_MS, schedule } from '../../src/domain/scheduler';

const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 10, 11, 12);

describe('schedule', () => {
  it('puts a wrong answer back in box 1, due in 10 minutes', () => {
    expect(schedule({ box: 4, due: now - DAY, seen: now - 7 * DAY }, false, now)).toEqual({ box: 1, due: now + RELEARN_MS, seen: now });
  });
  it('puts a new question answered correctly in box 1, due in 1 day', () => {
    expect(schedule(undefined, true, now)).toEqual({ box: 1, due: now + DAY, seen: now });
  });
  it('a new question answered wrongly is relearned', () => {
    expect(schedule(undefined, false, now)).toEqual({ box: 1, due: now + RELEARN_MS, seen: now });
  });
  it('moves a correct answer up a box', () => {
    expect(schedule({ box: 2, due: now, seen: now - 3 * DAY }, true, now)).toEqual({ box: 3, due: now + 7 * DAY, seen: now });
  });
  it('keeps box 5 at a 30-day interval', () => {
    expect(schedule({ box: 5, due: now, seen: now - 30 * DAY }, true, now)).toEqual({ box: 5, due: now + 30 * DAY, seen: now });
  });
});
