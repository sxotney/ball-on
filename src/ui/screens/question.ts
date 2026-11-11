// Asks one Scenario or Recall question; reports the marked answer.
import { markRecall, markRuling } from '../../domain/marking';
import type { Recall, Scenario } from '../../domain/types';
import type { Answered, Ctx } from '../context';
import { renderDiagram } from '../diagram';
import { h } from '../dom';
import { recallForm, rulingForm } from '../forms';

export function questionHeader(ctx: Ctx, q: { prompt: string; diagram?: Scenario['diagram'] }): HTMLElement[] {
  const s = ctx.session;
  return [
    h('p', { class: 'progress' }, s ? `${s.label} · ${s.index + 1} of ${s.questions.length}` : ''),
    h('p', { class: 'prompt' }, q.prompt),
    ...(q.diagram ? [h('figure', { class: 'diagram' }, renderDiagram(q.diagram))] : []),
  ];
}

export function renderQuestion(el: HTMLElement, ctx: Ctx, q: Scenario | Recall, onAnswered: (a: Answered) => void): void {
  const submit = h('button', { type: 'button', class: 'primary', 'data-action': 'submit', disabled: true }, q.kind === 'scenario' ? 'Make the Call' : 'Answer');
  let answer: Answered | null = null;
  let form: HTMLElement;
  if (q.kind === 'scenario') {
    form = rulingForm(ctx.bank.options, (r) => {
      answer = r ? { kind: 'scenario', given: r, mark: markRuling(q.ruling, r) } : null;
      submit.disabled = !answer;
    });
  } else {
    form = recallForm(q.answer, (given) => {
      answer = given === null ? null : { kind: 'recall', given, correct: markRecall(q.answer, given) };
      submit.disabled = !answer;
    });
  }
  submit.addEventListener('click', () => answer && onAnswered(answer));
  el.replaceChildren(h('section', { class: 'question' }, ...questionHeader(ctx, q), form, submit));
}
