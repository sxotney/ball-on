import type { RulingMark } from '../domain/marking';
import type { Bank, Question, Ruling } from '../domain/types';
import type { BuildMode, LocalData } from '../storage/store';

export interface Session {
  route: string;
  label: string;
  questions: Question[];
  index: number;
  marked: number;
  correct: number;
  /** Review build only: Drafts are answered cold and produce Verdicts, never progress. */
  drafts: boolean;
}

export type Answered =
  | { kind: 'scenario'; given: Ruling; mark: RulingMark }
  | { kind: 'recall'; given: number | string; correct: boolean };

export interface Ctx {
  bank: Bank;
  mode: BuildMode;
  data: LocalData;
  now: () => number;
  rng: () => number;
  nav: Navigator;
  session: Session | null;
  persist(): void;
  go(hash: string): void;
}
