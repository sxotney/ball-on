// Leitner-style spaced repetition. Wrong → back soon; right → further out.

export interface ReviewState { box: number; due: number; seen: number } // epoch ms

export const INTERVALS_DAYS = [1, 3, 7, 14, 30] as const; // boxes 1..5
export const RELEARN_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_BOX = INTERVALS_DAYS.length;

export function schedule(prev: ReviewState | undefined, correct: boolean, now: number): ReviewState {
  if (!correct) return { box: 1, due: now + RELEARN_MS, seen: now };
  const box = prev ? Math.min(prev.box + 1, MAX_BOX) : 1;
  return { box, due: now + INTERVALS_DAYS[box - 1]! * DAY_MS, seen: now };
}
