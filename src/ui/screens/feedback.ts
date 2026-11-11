// Shows each part of the answer marked, the explanation and citations, plus Flagging.
import type { Recall, Scenario } from '../../domain/types';
import type { Answered, Ctx } from '../context';
import { h } from '../dom';
import { CALL_LABEL, CUE_BALL_LABEL, penaltyLabel } from '../labels';

const tick = (ok: boolean) => h('span', { class: ok ? 'tick' : 'cross', 'aria-label': ok ? 'correct' : 'wrong' }, ok ? '✓' : '✗');

function row(part: string, title: string, ok: boolean, yours: string, correct: string): HTMLElement {
  return h('li', { class: `mark ${ok ? 'ok' : 'bad'}`, 'data-mark': part, 'data-correct': String(ok) },
    tick(ok), h('strong', {}, title), h('span', { class: 'yours' }, yours || '(nothing)'),
    !ok && h('span', { class: 'correct' }, `Correct: ${correct || '(nothing)'}`),
  );
}

export function marksList(ctx: Ctx, q: Scenario | Recall, a: Answered): HTMLElement {
  if (q.kind === 'scenario' && a.kind === 'scenario') {
    const optLabel = (ids: string[]) => ids.map((id) => `• ${ctx.bank.options.find((o) => o.id === id)?.label ?? id}`).join('\n');
    return h('ul', { class: 'marks' },
      row('calls', 'Call', a.mark.calls, a.given.calls.map((c) => CALL_LABEL[c]).join(' + '), q.ruling.calls.map((c) => CALL_LABEL[c]).join(' + ')),
      row('penaltyPoints', 'Penalty Points', a.mark.penaltyPoints, penaltyLabel(a.given.penaltyPoints), penaltyLabel(q.ruling.penaltyPoints)),
      row('options', 'Options', a.mark.options, optLabel(a.given.options), optLabel(q.ruling.options)),
      row('cueBall', 'Cue-ball', a.mark.cueBall, CUE_BALL_LABEL[a.given.cueBall], CUE_BALL_LABEL[q.ruling.cueBall]),
    );
  }
  if (q.kind === 'recall' && a.kind === 'recall') {
    const correct = q.answer.type === 'number' ? String(q.answer.value) : q.answer.correct;
    return h('ul', { class: 'marks' }, row('answer', 'Answer', a.correct, String(a.given), correct));
  }
  return h('ul', { class: 'marks' });
}

export const citationLine = (citations: string[]) =>
  h('p', { class: 'citations' }, `Check in the Rulebook: ${citations.join(', ')}`);

export function flagControl(ctx: Ctx, questionId: string): HTMLElement {
  const box = h('div', { class: 'flag' });
  const open = h('button', {
    type: 'button', class: 'link', 'data-action': 'flag',
    onclick: () => {
      const note = h('textarea', { 'data-flag-note': true, rows: 3, placeholder: "What looks wrong or unclear?", 'aria-label': 'Flag note' });
      const saveBtn = h('button', {
        type: 'button', class: 'secondary', 'data-action': 'save-flag',
        onclick: () => {
          ctx.data.flags.push({ questionId, note: note.value.trim(), at: ctx.now() });
          ctx.persist();
          box.replaceChildren(h('p', { class: 'note' }, 'Flag saved. Send your flags to Rani from Settings.'));
        },
      }, 'Save flag');
      box.replaceChildren(note, saveBtn);
    },
  }, 'Flag this question');
  box.append(open);
  return box;
}

export function renderFeedback(el: HTMLElement, ctx: Ctx, q: Scenario | Recall, a: Answered, onNext: () => void): void {
  const correct = a.kind === 'scenario' ? a.mark.correct : a.correct;
  el.replaceChildren(h('section', { class: 'feedback' },
    h('h2', { class: correct ? 'verdict ok' : 'verdict bad' }, correct ? 'Correct Ruling' : 'Not quite'),
    marksList(ctx, q, a),
    h('p', { class: 'explanation' }, q.explanation),
    citationLine(q.citations),
    flagControl(ctx, q.id),
    h('button', { type: 'button', class: 'primary', 'data-action': 'next', onclick: onNext }, 'Next'),
  ));
}
