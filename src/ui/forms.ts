// Answer forms. The Ruling form follows referee order: Call, Penalty Points, Options, Cue-ball (ADR 0003).
import { CALLS, CUE_BALL_STATES, PENALTY_POINTS } from '../domain/types';
import type { Call, CueBall, OptionDef, PenaltyPoints, RecallAnswer, Ruling } from '../domain/types';
import { h } from './dom';
import { CALL_LABEL, CUE_BALL_LABEL, penaltyLabel } from './labels';

/** Renders the form; onChange receives the Ruling once it's complete enough to submit, else null. */
export function rulingForm(options: OptionDef[], onChange: (r: Ruling | null) => void): HTMLElement {
  const calls = new Set<Call>();
  let penaltyPoints: PenaltyPoints = 0;
  const chosen = new Set<string>();
  let cueBall: CueBall | null = null;

  const emit = () =>
    onChange(calls.size > 0 && cueBall ? { calls: [...calls], penaltyPoints, options: [...chosen], cueBall } : null);

  const callButtons = CALLS.map((c) =>
    h('button', { type: 'button', class: 'chip', 'data-call': c, 'aria-pressed': 'false', onclick: () => toggleCall(c) }, CALL_LABEL[c]),
  );
  const toggleCall = (c: Call) => {
    if (calls.has(c)) calls.delete(c);
    else {
      if (c === 'NO_FOUL') calls.clear();
      else calls.delete('NO_FOUL');
      calls.add(c);
    }
    callButtons.forEach((b) => b.setAttribute('aria-pressed', String(calls.has(b.dataset.call as Call))));
    emit();
  };

  const penaltyButtons = PENALTY_POINTS.map((p) =>
    h('button', {
      type: 'button', class: 'seg', 'data-penalty': p, 'aria-pressed': String(p === penaltyPoints),
      onclick: () => {
        penaltyPoints = p;
        penaltyButtons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.penalty) === p)));
        emit();
      },
    }, penaltyLabel(p)),
  );

  const optionRows = options.map((o) =>
    h('label', { class: 'option' },
      h('input', {
        type: 'checkbox', 'data-option': o.id,
        onclick: (e) => {
          const box = e.currentTarget as HTMLInputElement;
          if (box.checked) chosen.add(o.id);
          else chosen.delete(o.id);
          emit();
        },
      }),
      h('span', {}, o.label),
    ),
  );

  const cueButtons = CUE_BALL_STATES.map((c) =>
    h('button', {
      type: 'button', class: 'seg', 'data-cueball': c, 'aria-pressed': 'false',
      onclick: () => {
        cueBall = c;
        cueButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cueball === c)));
        emit();
      },
    }, CUE_BALL_LABEL[c]),
  );

  return h('div', { class: 'ruling-form' },
    h('fieldset', {}, h('legend', {}, '1. Call'), h('div', { class: 'chips' }, callButtons)),
    h('fieldset', {}, h('legend', {}, '2. Penalty Points'), h('div', { class: 'segments' }, penaltyButtons)),
    h('fieldset', {}, h('legend', {}, '3. Options for the Incoming Player'), h('div', { class: 'options' }, optionRows)),
    h('fieldset', {}, h('legend', {}, '4. Cue-ball'), h('div', { class: 'segments' }, cueButtons)),
  );
}

export function recallForm(answer: RecallAnswer, onChange: (given: number | string | null) => void): HTMLElement {
  if (answer.type === 'number') {
    const input = h('input', {
      type: 'number', inputmode: 'numeric', class: 'recall-number', 'data-recall-number': true, 'aria-label': 'Your answer',
      oninput: (e) => {
        const v = (e.currentTarget as HTMLInputElement).value.trim();
        onChange(v === '' || Number.isNaN(Number(v)) ? null : Number(v));
      },
    });
    return h('div', { class: 'recall-form' }, input);
  }
  const buttons = answer.choices.map((c) =>
    h('button', {
      type: 'button', class: 'choice', 'data-choice': c, 'aria-pressed': 'false',
      onclick: () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.choice === c)));
        onChange(c);
      },
    }, c),
  );
  return h('div', { class: 'recall-form choices' }, buttons);
}
