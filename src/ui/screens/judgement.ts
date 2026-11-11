// Judgement Calls: commit to a view, then read the considerations. Never marked (CONTEXT.md).
import type { JudgementCall } from '../../domain/types';
import type { Ctx } from '../context';
import { h } from '../dom';
import { citationLine, flagControl } from './feedback';
import { questionHeader } from './question';

export function renderJudgement(el: HTMLElement, ctx: Ctx, q: JudgementCall, onNext: () => void): void {
  const after = h('div', { class: 'considerations' });
  const reveal = h('button', {
    type: 'button', class: 'primary', 'data-action': 'show-considerations',
    onclick: () => {
      reveal.remove();
      after.append(
        h('h2', {}, 'Considerations'),
        h('p', {}, q.considerations),
        citationLine(q.citations),
        flagControl(ctx, q.id),
        h('button', { type: 'button', class: 'primary', 'data-action': 'next', onclick: onNext }, 'Next'),
      );
    },
  }, 'Show considerations');
  el.replaceChildren(h('section', { class: 'question judgement' },
    h('p', { class: 'kind' }, 'Judgement Call: not marked'),
    ...questionHeader(ctx, q),
    h('textarea', { rows: 3, placeholder: 'Your view…', 'aria-label': 'Your view' }),
    reveal, after,
  ));
}
