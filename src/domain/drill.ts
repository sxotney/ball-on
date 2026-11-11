// Picks the Questions for Today's Drill and for Topic practice.
import type { ReviewState } from './scheduler';
import type { Question } from './types';

export const DRILL_SIZE = 10;
export const MAX_NEW_PER_DRILL = 3;

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function buildDrill(
  questions: Question[],
  progress: Record<string, ReviewState>,
  now: number,
  rng: () => number = Math.random,
): Question[] {
  const markable = questions.filter((q) => q.kind !== 'judgement');
  const due = markable
    .filter((q) => progress[q.id] !== undefined && progress[q.id]!.due <= now)
    .sort((a, b) => progress[a.id]!.due - progress[b.id]!.due)
    .slice(0, DRILL_SIZE);
  const fresh = shuffle(markable.filter((q) => progress[q.id] === undefined), rng);
  const newAllowed = due.length === 0 ? DRILL_SIZE : Math.min(MAX_NEW_PER_DRILL, DRILL_SIZE - due.length);
  return [...due, ...fresh.slice(0, newAllowed)];
}

export function topicSession(questions: Question[], topic: string, rng: () => number = Math.random): Question[] {
  const inTopic = shuffle(questions.filter((q) => q.topic === topic), rng);
  return [...inTopic.filter((q) => q.kind !== 'judgement'), ...inTopic.filter((q) => q.kind === 'judgement')];
}
