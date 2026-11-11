import { describe, expect, it } from 'vitest';
import { REVIEW_PATH } from '../../vite.config';

describe('learner service worker navigate denylist', () => {
  it.each(['/ball-on/review', '/ball-on/review/', '/ball-on/review/index.html'])('excludes %s', (p) =>
    expect(REVIEW_PATH.test(p)).toBe(true));
  it.each(['/ball-on/', '/ball-on/reviewer', '/ball-on/index.html'])('keeps %s', (p) =>
    expect(REVIEW_PATH.test(p)).toBe(false));
});
