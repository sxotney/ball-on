import { describe, expect, it } from 'vitest';
import { buildDrill, DRILL_SIZE, topicSession } from '../../src/domain/drill';
import type { ReviewState } from '../../src/domain/scheduler';
import type { Question } from '../../src/domain/types';
import { judgement, recall, scenario } from '../fixtures/questions';

const now = Date.UTC(2026, 10, 11, 12);
const HOUR = 60 * 60 * 1000;
const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const many = (prefix: string, n: number): Question[] =>
  Array.from({ length: n }, (_, i) => scenario({ id: `${prefix}-${String(i).padStart(3, '0')}` }));
const dueAt = (qs: Question[], hoursAgo: (i: number) => number): Record<string, ReviewState> =>
  Object.fromEntries(qs.map((q, i) => [q.id, { box: 2, due: now - hoursAgo(i) * HOUR, seen: now - 72 * HOUR }]));

describe('buildDrill', () => {
  it('fills a drill with due questions before new ones', () => {
    const due = many('due', 12);
    const drill = buildDrill([...due, ...many('new', 5)], dueAt(due, (i) => i + 1), now, seeded());
    expect(drill).toHaveLength(DRILL_SIZE);
    expect(drill.every((q) => q.id.startsWith('due'))).toBe(true);
  });
  it('orders due questions most overdue first', () => {
    const due = many('due', 3);
    const drill = buildDrill(due, dueAt(due, (i) => i + 1), now, seeded());
    expect(drill.map((q) => q.id)).toEqual(['due-002', 'due-001', 'due-000']);
  });
  it('adds at most 3 new questions when some are due', () => {
    const due = many('due', 2);
    const drill = buildDrill([...due, ...many('new', 20)], dueAt(due, () => 1), now, seeded());
    expect(drill.filter((q) => q.id.startsWith('due'))).toHaveLength(2);
    expect(drill.filter((q) => q.id.startsWith('new'))).toHaveLength(3);
  });
  it('gives a full drill of new questions when nothing is due', () => {
    expect(buildDrill(many('new', 20), {}, now, seeded())).toHaveLength(10);
  });
  it('is empty when everything has been seen and nothing is due', () => {
    const qs = many('seen', 4);
    expect(buildDrill(qs, dueAt(qs, () => -24), now, seeded())).toEqual([]);
  });
  it('never includes a judgement call', () => {
    const drill = buildDrill([judgement(), recall(), scenario()], {}, now, seeded());
    expect(drill.map((q) => q.kind).sort()).toEqual(['recall', 'scenario']);
  });
  it('ignores progress for questions that no longer exist', () => {
    const progress = { 'gone-001': { box: 1, due: now - HOUR, seen: now - 2 * HOUR } };
    expect(buildDrill([scenario({ id: 'fam-001' })], progress, now, seeded()).map((q) => q.id)).toEqual(['fam-001']);
  });
});

describe('topicSession', () => {
  it('returns every question in the topic with judgement calls last', () => {
    const qs = [judgement({ id: 'j1' }), scenario({ id: 's1' }), recall({ id: 'r1' }), scenario({ id: 'x1', topic: 'free-ball' })];
    const session = topicSession(qs, 'foul-and-a-miss', seeded());
    expect(session.map((q) => q.id).sort()).toEqual(['j1', 'r1', 's1']);
    expect(session.at(-1)?.kind).toBe('judgement');
  });
});
