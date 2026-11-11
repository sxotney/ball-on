// Hand-written checks for question and Options List data. Each returns a list of messages; [] means valid.
import { isValidCitation } from './citation';
import { BALL_COLOURS, CALLS, CUE_BALL_STATES, PENALTY_POINTS } from './types';

const PLAYING_AREA = { width: 1778, length: 3569 };
const KINDS = ['scenario', 'recall', 'judgement'];

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNonEmptyString = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');

export function validateQuestion(q: unknown, optionIds: Set<string>, topicSlugs: Set<string>): string[] {
  if (!isObj(q)) return ['question: must be an object'];
  const id = isNonEmptyString(q.id) ? q.id : '(no id)';
  const errors: string[] = [];
  const err = (field: string, msg: string) => errors.push(`${id}: ${field}: ${msg}`);

  if (!isNonEmptyString(q.id)) err('id', 'must be a non-empty string');
  if (!isNonEmptyString(q.topic) || !topicSlugs.has(q.topic)) err('topic', `unknown topic ${JSON.stringify(q.topic)}`);
  if (q.edition !== '2024-09') err('edition', 'must be "2024-09"');
  if (q.status !== 'draft' && q.status !== 'reviewed') err('status', 'must be "draft" or "reviewed"');
  if (!isStringArray(q.citations) || q.citations.length === 0) err('citations', 'must list at least one citation');
  else for (const c of q.citations) if (!isValidCitation(c)) err('citations', `invalid citation ${JSON.stringify(c)}`);
  if (!isNonEmptyString(q.prompt)) err('prompt', 'must be a non-empty string');
  if (q.diagram !== undefined) validateDiagram(q.diagram, err);

  if (typeof q.kind !== 'string' || !KINDS.includes(q.kind)) {
    err('kind', `must be one of ${KINDS.join(', ')}`);
    return errors;
  }
  if (q.kind === 'scenario') {
    if (!isNonEmptyString(q.explanation)) err('explanation', 'must be a non-empty string');
    validateRuling(q.ruling, optionIds, err);
  } else if (q.kind === 'recall') {
    if (!isNonEmptyString(q.explanation)) err('explanation', 'must be a non-empty string');
    validateRecallAnswer(q.answer, err);
  } else if (!isNonEmptyString(q.considerations)) {
    err('considerations', 'must be a non-empty string');
  }
  return errors;
}

type Err = (field: string, msg: string) => void;

function validateRuling(r: unknown, optionIds: Set<string>, err: Err): void {
  if (!isObj(r)) return err('ruling', 'must be an object');
  const calls = r.calls;
  if (!isStringArray(calls) || calls.length === 0) err('ruling.calls', 'must list at least one call');
  else {
    for (const c of calls) if (!(CALLS as readonly string[]).includes(c)) err('ruling.calls', `unknown call ${c}`);
    if (new Set(calls).size !== calls.length) err('ruling.calls', 'duplicate call');
    if (calls.includes('NO_FOUL') && calls.length > 1) err('ruling.calls', 'NO_FOUL cannot be combined with other calls');
    if (calls.includes('FOUL') && calls.includes('FOUL_AND_A_MISS')) err('ruling.calls', 'use FOUL_AND_A_MISS alone, not with FOUL');
  }
  if (!(PENALTY_POINTS as readonly unknown[]).includes(r.penaltyPoints)) err('ruling.penaltyPoints', 'must be 0, 4, 5, 6 or 7');
  else if (isStringArray(calls) && calls.includes('NO_FOUL') && r.penaltyPoints !== 0)
    err('ruling.penaltyPoints', 'must be 0 when the call is NO_FOUL');
  if (!isStringArray(r.options)) err('ruling.options', 'must be a list of option ids');
  else {
    for (const o of r.options) if (!optionIds.has(o)) err('ruling.options', `unknown option ${o}`);
    if (new Set(r.options).size !== r.options.length) err('ruling.options', 'duplicate option');
  }
  if (!(CUE_BALL_STATES as readonly unknown[]).includes(r.cueBall)) err('ruling.cueBall', `must be one of ${CUE_BALL_STATES.join(', ')}`);
}

function validateRecallAnswer(a: unknown, err: Err): void {
  if (!isObj(a)) return err('answer', 'must be an object');
  if (a.type === 'number') {
    if (typeof a.value !== 'number' || !Number.isFinite(a.value)) err('answer', 'value must be a number');
  } else if (a.type === 'choice') {
    if (!isStringArray(a.choices) || a.choices.length < 2) err('answer', 'choices must list at least two strings');
    else if (typeof a.correct !== 'string' || !a.choices.includes(a.correct)) err('answer', 'correct must be one of the choices');
  } else err('answer', 'type must be "number" or "choice"');
}

function validateDiagram(d: unknown, err: Err): void {
  if (!isObj(d) || !Array.isArray(d.balls)) return err('diagram', 'must have a balls list');
  let whites = 0;
  for (const b of d.balls) {
    if (!isObj(b) || !(BALL_COLOURS as readonly unknown[]).includes(b.ball)) { err('diagram', 'unknown ball'); continue; }
    if (b.ball === 'white') whites++;
    const ok = (n: unknown, max: number) => typeof n === 'number' && n >= 0 && n <= max;
    if (!ok(b.x, PLAYING_AREA.width) || !ok(b.y, PLAYING_AREA.length)) err('diagram', `${String(b.ball)} ball is off the playing area`);
  }
  if (whites > 1) err('diagram', 'more than one white ball');
  if (d.caption !== undefined && typeof d.caption !== 'string') err('diagram', 'caption must be a string');
  if (d.view !== undefined && !['full', 'top', 'bottom'].includes(d.view as string)) err('diagram', 'view must be full, top or bottom');
}

export function validateOptionsList(o: unknown): string[] {
  if (!Array.isArray(o) || o.length === 0) return ['options-list: must be a non-empty list'];
  const errors: string[] = [];
  const seen = new Set<string>();
  o.forEach((opt, i) => {
    if (!isObj(opt) || !isNonEmptyString(opt.id)) return errors.push(`options-list[${i}]: id must be a non-empty string`);
    if (seen.has(opt.id)) errors.push(`options-list: duplicate id ${opt.id}`);
    seen.add(opt.id);
    if (!isNonEmptyString(opt.label)) errors.push(`options-list ${opt.id}: label must be a non-empty string`);
    if (typeof opt.citation !== 'string' || !isValidCitation(opt.citation)) errors.push(`options-list ${opt.id}: invalid citation`);
  });
  return errors;
}
