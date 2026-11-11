// Strict marking (ADR 0003): a Ruling is correct only if every part is right.
import type { RecallAnswer, Ruling } from './types';

export interface RulingMark { calls: boolean; penaltyPoints: boolean; options: boolean; cueBall: boolean; correct: boolean }

const sameSet = <T>(a: readonly T[], b: readonly T[]): boolean => {
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && [...sa].every((x) => sb.has(x));
};

export function markRuling(expected: Ruling, given: Ruling): RulingMark {
  const calls = sameSet(expected.calls, given.calls);
  const penaltyPoints = expected.penaltyPoints === given.penaltyPoints;
  const options = sameSet(expected.options, given.options);
  const cueBall = expected.cueBall === given.cueBall;
  return { calls, penaltyPoints, options, cueBall, correct: calls && penaltyPoints && options && cueBall };
}

export function markRecall(expected: RecallAnswer, given: number | string): boolean {
  return expected.type === 'number' ? given === expected.value : given === expected.correct;
}
