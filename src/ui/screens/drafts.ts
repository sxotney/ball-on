// Review build only (ADR 0005): a Reviewer answers each Draft cold, compares with the drafted Ruling,
// then records Agree or Dispute. Drafts never create spaced-repetition progress.
import type { Question } from '../../domain/types';
import { verdictsMessage } from '../../share/messages';
import { shareText } from '../../share/share';
import type { Answered, Ctx } from '../context';
import { h } from '../dom';
import { citationLine, marksList } from './feedback';
import { renderSession, startSession } from './session';

export const pendingDrafts = (ctx: Ctx, drafts: Question[]) =>
  drafts.filter((q) => !ctx.data.verdicts.some((v) => v.questionId === q.id));

export function draftsHomeExtras(ctx: Ctx, drafts: Question[]): HTMLElement[] {
  const pending = pendingDrafts(ctx, drafts).length;
  const status = h('p', { class: 'note', role: 'status' });
  const extras: HTMLElement[] = [
    h('button', {
      type: 'button', class: 'primary drafts', 'data-action': 'drafts', disabled: pending === 0,
      onclick: () => { ctx.session = null; ctx.go('#/drafts'); },
    }, `Drafts to review (${pending})`),
  ];
  if (ctx.data.verdicts.length > 0) {
    extras.push(
      h('button', {
        type: 'button', class: 'secondary', 'data-action': 'send-verdicts',
        onclick: async () => {
          const result = await shareText('Ball On review verdicts', verdictsMessage(ctx.data.verdicts), ctx.nav);
          status.textContent = {
            shared: 'Verdicts shared.',
            copied: 'Verdicts copied. Paste them into a message to Carl.',
            cancelled: '',
            failed: "Couldn't share or copy the verdicts on this device.",
          }[result];
        },
      }, `Send verdicts to Carl (${ctx.data.verdicts.length})`),
      status,
    );
  }
  return extras;
}

function verdictPanel(ctx: Ctx, q: Question, a: Answered | null, next: () => void): HTMLElement {
  const record = (agreed: boolean, note: string) => {
    ctx.data.verdicts = ctx.data.verdicts.filter((v) => v.questionId !== q.id);
    ctx.data.verdicts.push({
      questionId: q.id,
      agreed,
      ...(a?.kind === 'scenario' ? { reviewerRuling: a.given } : {}),
      ...(a?.kind === 'recall' ? { reviewerAnswer: a.given } : {}),
      note,
      at: ctx.now(),
    });
    ctx.persist();
    next();
  };
  const note = h('textarea', { rows: 3, 'data-dispute-note': true, placeholder: 'What should it be, and which rule says so?', 'aria-label': 'Dispute note' });
  const dispute = h('button', { type: 'button', class: 'secondary', 'data-action': 'dispute', disabled: true, onclick: () => record(false, note.value.trim()) }, 'Dispute');
  note.addEventListener('input', () => { dispute.disabled = note.value.trim() === ''; });
  return h('div', { class: 'verdict-panel' },
    h('h2', {}, 'Do you agree with the drafted answer?'),
    h('button', { type: 'button', class: 'primary', 'data-action': 'agree', onclick: () => record(true, '') }, 'Agree'),
    note,
    dispute,
  );
}

export function renderDrafts(el: HTMLElement, ctx: Ctx, drafts: Question[]): void {
  const s = ctx.session?.route === '#/drafts' ? ctx.session : startSession(ctx, '#/drafts', 'Drafts', pendingDrafts(ctx, drafts), true);
  renderSession(el, ctx, s, {
    afterAnswer: (q, a, next) => {
      if (q.kind === 'judgement') return;
      el.replaceChildren(h('section', { class: 'feedback' },
        h('h2', {}, 'Your answer against the draft'),
        marksList(ctx, q, a),
        h('p', { class: 'explanation' }, q.explanation),
        citationLine(q.citations),
        verdictPanel(ctx, q, a, next),
      ));
    },
    afterJudgement: (q, next) => verdictPanel(ctx, q, null, next),
  });
}
