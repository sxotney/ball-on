// Walks through a Drill or Topic practice, one Question at a time.
import { schedule } from '../../domain/scheduler';
import type { JudgementCall, Question } from '../../domain/types';
import type { Answered, Ctx, Session } from '../context';
import { h } from '../dom';
import { renderFeedback } from './feedback';
import { renderJudgement } from './judgement';
import { renderQuestion } from './question';

export interface SessionHooks {
  afterAnswer?: (q: Question, a: Answered, next: () => void) => void;
  /** Replaces the Judgement Call's Next button with this panel (Review build). */
  afterJudgement?: (q: JudgementCall, next: () => void) => HTMLElement;
}

export function startSession(ctx: Ctx, route: string, label: string, questions: Question[], drafts = false): Session {
  ctx.session = { route, label, questions, index: 0, marked: 0, correct: 0, drafts };
  return ctx.session;
}

export function renderSession(el: HTMLElement, ctx: Ctx, s: Session, hooks: SessionHooks = {}): void {
  const q = s.questions[s.index];
  const next = () => { s.index++; renderSession(el, ctx, s, hooks); };
  if (!q) return renderEnd(el, ctx, s);
  if (q.kind === 'judgement') return renderJudgement(el, ctx, q, next, hooks.afterJudgement && (() => hooks.afterJudgement!(q, next)));
  renderQuestion(el, ctx, q, (a) => {
    const correct = a.kind === 'scenario' ? a.mark.correct : a.correct;
    s.marked++;
    if (correct) s.correct++;
    if (!s.drafts) {
      ctx.data.progress[q.id] = schedule(ctx.data.progress[q.id], correct, ctx.now());
      ctx.persist();
    }
    if (hooks.afterAnswer) hooks.afterAnswer(q, a, next);
    else renderFeedback(el, ctx, q, a, next);
  });
}

function renderEnd(el: HTMLElement, ctx: Ctx, s: Session): void {
  el.replaceChildren(h('section', { class: 'end' },
    h('h1', {}, `${s.label} complete`),
    s.marked > 0 && h('p', { class: 'score' }, `${s.correct} of ${s.marked} correct`),
    h('button', { type: 'button', class: 'primary', 'data-action': 'home', onclick: () => { ctx.session = null; ctx.go('#/'); } }, 'Home'),
  ));
}
