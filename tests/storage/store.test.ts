import { describe, expect, it } from 'vitest';
import { emptyData, exportJson, importJson, load, save, storageKey, type LocalData } from '../../src/storage/store';

class MemoryStorage implements Storage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, v); }
}

const sample: LocalData = {
  version: 1,
  progress: { 'fam-001': { box: 2, due: 1000, seen: 500 } },
  flags: [{ questionId: 'fam-001', note: 'Unclear', at: 400 }],
  verdicts: [],
};

describe('store', () => {
  it('uses a separate key per build', () => {
    expect(storageKey('learner')).toBe('ball-on:learner:v1');
    expect(storageKey('review')).toBe('ball-on:review:v1');
  });
  it('keeps learner and review data apart on one origin', () => {
    const s = new MemoryStorage();
    save('learner', sample, s);
    expect(load('review', s)).toEqual(emptyData());
    expect(load('learner', s)).toEqual(sample);
  });
  it('treats unparseable data as empty', () => {
    const s = new MemoryStorage();
    s.setItem('ball-on:learner:v1', '{not json');
    expect(load('learner', s)).toEqual(emptyData());
  });
  it('treats another version as empty', () => {
    const s = new MemoryStorage();
    s.setItem('ball-on:learner:v1', '{"version":0}');
    expect(load('learner', s)).toEqual(emptyData());
  });
  it('treats a malformed progress entry as empty', () => {
    const s = new MemoryStorage();
    s.setItem('ball-on:learner:v1', JSON.stringify({ ...sample, progress: { x: { box: 'two' } } }));
    expect(load('learner', s)).toEqual(emptyData());
  });
  it('survives storage that throws', () => {
    const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } } as unknown as Storage;
    expect(load('learner', broken)).toEqual(emptyData());
    expect(() => save('learner', sample, broken)).not.toThrow();
  });
  it('round-trips export and import', () => {
    expect(importJson(exportJson(sample))).toEqual({ ok: true, data: sample });
  });
  it.each(['[]', '{"version":2}', 'x'])('rejects import of %j with a readable error', (text) => {
    const result = importJson(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Ball On backup/);
  });
});
