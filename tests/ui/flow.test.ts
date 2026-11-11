import { beforeEach, describe, expect, it } from 'vitest';
import { mountApp } from '../../src/ui/app';
import { load } from '../../src/storage/store';
import { judgement, recall, scenario } from '../fixtures/questions';
import { bankOf, click, flush, MemoryStorage } from './helpers';

const now = () => Date.UTC(2026, 10, 11, 12);
let root: HTMLElement;
let storage: MemoryStorage;

beforeEach(() => {
  location.hash = '';
  document.body.innerHTML = '<main id="app"></main>';
  root = document.getElementById('app')!;
  storage = new MemoryStorage();
});

const mount = (questions = [scenario(), scenario({ id: 'fam-002' }), recall(), judgement()]) =>
  mountApp(root, bankOf(questions), 'learner', { now, storage, rng: () => 0.5 });

describe('Home', () => {
  it("offers Today's Drill with the number of questions ready", () => {
    mount();
    expect(root.querySelector('[data-action="drill"]')?.textContent).toContain('3');
    expect(root.textContent).toContain('Foul and a Miss');
  });
  it('explains an empty bank instead of offering a Drill', () => {
    mount([]);
    expect(root.textContent).toContain('No reviewed questions yet');
    expect(root.querySelector('[data-action="drill"]')).toBeNull();
  });
  it('says nothing is due when every question is scheduled later', () => {
    storage.setItem('ball-on:learner:v1', JSON.stringify({
      version: 1, flags: [], verdicts: [], progress: { 'fam-001': { box: 3, due: now() + 1e9, seen: now() } },
    }));
    mount([scenario()]);
    expect(root.textContent).toContain('Nothing due');
    expect(root.querySelector('[data-action="drill"]')).toBeNull();
  });
});

describe('Making a Ruling', () => {
  beforeEach(async () => {
    mount([scenario()]);
    click(root, '[data-action="drill"]');
    await flush();
  });

  it('keeps Make the Call disabled until a Call and cue-ball are chosen', () => {
    const submit = root.querySelector<HTMLButtonElement>('[data-action="submit"]')!;
    expect(submit.disabled).toBe(true);
    click(root, '[data-call="FOUL_AND_A_MISS"]');
    expect(submit.disabled).toBe(true);
    click(root, '[data-cueball="WHERE_IT_LIES"]');
    expect(submit.disabled).toBe(false);
  });

  it('marks only Options wrong when one option is missed, and relearns the question', async () => {
    click(root, '[data-call="FOUL_AND_A_MISS"]');
    click(root, '[data-penalty="4"]');
    click(root, '[data-option="PLAY_FROM_POSITION_LEFT"]');
    click(root, '[data-option="OFFENDER_AGAIN_POSITION_LEFT"]');
    click(root, '[data-cueball="WHERE_IT_LIES"]');
    click(root, '[data-action="submit"]');
    await flush();
    const mark = (part: string) => root.querySelector(`[data-mark="${part}"]`)?.getAttribute('data-correct');
    expect([mark('calls'), mark('penaltyPoints'), mark('options'), mark('cueBall')]).toEqual(['true', 'true', 'false', 'true']);
    expect(root.textContent).toContain('S3 R14(c)');
    expect(load('learner', storage).progress['fam-001']?.box).toBe(1);
  });

  it('saves a Flag with a note', async () => {
    click(root, '[data-call="FOUL"]');
    click(root, '[data-cueball="IN_HAND"]');
    click(root, '[data-action="submit"]');
    await flush();
    click(root, '[data-action="flag"]');
    root.querySelector<HTMLTextAreaElement>('[data-flag-note]')!.value = 'Cue-ball wording unclear';
    click(root, '[data-action="save-flag"]');
    expect(load('learner', storage).flags).toEqual([{ questionId: 'fam-001', note: 'Cue-ball wording unclear', at: now() }]);
  });

  it('shows the score at the end of the Drill', async () => {
    click(root, '[data-call="FOUL"]');
    click(root, '[data-cueball="IN_HAND"]');
    click(root, '[data-action="submit"]');
    await flush();
    click(root, '[data-action="next"]');
    await flush();
    expect(root.textContent).toContain('0 of 1 correct');
  });
});

describe('Recall', () => {
  it('marks a number answer strictly', async () => {
    mount([recall()]);
    click(root, '[data-action="drill"]');
    await flush();
    root.querySelector<HTMLInputElement>('[data-recall-number]')!.value = '7';
    root.querySelector<HTMLInputElement>('[data-recall-number]')!.dispatchEvent(new Event('input'));
    click(root, '[data-action="submit"]');
    await flush();
    expect(root.querySelector('[data-mark="answer"]')?.getAttribute('data-correct')).toBe('true');
  });
});

describe('Judgement Calls', () => {
  it('are shown in Topic practice without marks', async () => {
    mount([judgement()]);
    click(root, '[data-topic="foul-and-a-miss"]');
    await flush();
    click(root, '[data-action="show-considerations"]');
    expect(root.textContent).toContain('Pace, angle');
    expect(root.querySelector('[data-mark]')).toBeNull();
    expect(load('learner', storage).progress).toEqual({});
  });
});

describe('Call chips', () => {
  it('treats FOUL and FOUL AND A MISS as alternatives', async () => {
    mount([scenario()]);
    click(root, '[data-action="drill"]');
    await flush();
    const pressed = () => [...root.querySelectorAll('[data-call][aria-pressed="true"]')].map((b) => (b as HTMLElement).dataset.call);
    click(root, '[data-call="FOUL"]');
    click(root, '[data-call="FOUL_AND_A_MISS"]');
    expect(pressed()).toEqual(['FOUL_AND_A_MISS']);
    click(root, '[data-call="FREE_BALL"]');
    click(root, '[data-call="FOUL"]');
    expect(pressed()).toEqual(['FOUL', 'FREE_BALL']);
  });
});
