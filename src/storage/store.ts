// On-device storage (ADR 0004). One key per build, because both builds share the github.io origin.
import type { ReviewState } from '../domain/scheduler';
import type { Ruling } from '../domain/types';

export interface Flag { questionId: string; note: string; at: number }
export interface Verdict {
  questionId: string;
  agreed: boolean;
  reviewerRuling?: Ruling;
  reviewerAnswer?: number | string;
  note: string;
  at: number;
}
export interface LocalData { version: 1; progress: Record<string, ReviewState>; flags: Flag[]; verdicts: Verdict[] }
export type BuildMode = 'learner' | 'review';

export const storageKey = (mode: BuildMode): string => `ball-on:${mode}:v1`;
export const emptyData = (): LocalData => ({ version: 1, progress: {}, flags: [], verdicts: [] });

const defaultStorage = (): Storage | undefined => {
  try { return globalThis.localStorage; } catch { return undefined; }
};

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

function isLocalData(x: unknown): x is LocalData {
  if (!isObj(x) || x.version !== 1 || !isObj(x.progress) || !Array.isArray(x.flags) || !Array.isArray(x.verdicts)) return false;
  const progressOk = Object.values(x.progress).every((p) => isObj(p) && isNum(p.box) && isNum(p.due) && isNum(p.seen));
  const flagsOk = x.flags.every((f) => isObj(f) && typeof f.questionId === 'string' && typeof f.note === 'string' && isNum(f.at));
  const verdictsOk = x.verdicts.every(
    (v) => isObj(v) && typeof v.questionId === 'string' && typeof v.agreed === 'boolean' && typeof v.note === 'string' && isNum(v.at),
  );
  return progressOk && flagsOk && verdictsOk;
}

export function load(mode: BuildMode, storage: Storage | undefined = defaultStorage()): LocalData {
  try {
    const raw = storage?.getItem(storageKey(mode));
    if (!raw) return emptyData();
    const parsed: unknown = JSON.parse(raw);
    return isLocalData(parsed) ? parsed : emptyData();
  } catch {
    return emptyData();
  }
}

export function save(mode: BuildMode, data: LocalData, storage: Storage | undefined = defaultStorage()): void {
  try {
    storage?.setItem(storageKey(mode), JSON.stringify(data));
  } catch {
    // Private browsing or storage full: keep going without persistence.
  }
}

export const exportJson = (data: LocalData): string => JSON.stringify(data, null, 2);

export function importJson(text: string): { ok: true; data: LocalData } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file isn't a Ball On backup (it isn't valid JSON)." };
  }
  return isLocalData(parsed)
    ? { ok: true, data: parsed }
    : { ok: false, error: "This file isn't a Ball On backup from this version of the app." };
}
