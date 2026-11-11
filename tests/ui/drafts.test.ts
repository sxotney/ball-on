import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountApp } from '../../src/ui/app';
import { load } from '../../src/storage/store';
import { judgement, scenario } from '../fixtures/questions';
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

const drafts = () => [
  scenario({ id: 'fam-001', status: 'draft' }),
  scenario({ id: 'fam-002', status: 'draft' }),
  scenario({ id: 'fam-003', status: 'reviewed' }),
];

const answerFirstDraft = async () => {
  click(root, '[data-action="drafts"]');
  await flush();
  click(root, '[data-call="FOUL_AND_A_MISS"]');
  click(root, '[data-cueball="WHERE_IT_LIES"]');
  click(root, '[data-action="submit"]');
  await flush();
};

describe('Review build', () => {
  it('shows how many drafts are waiting', () => {
    mountApp(root, bankOf(drafts()), 'review', { now, storage });
    expect(root.querySelector('[data-action="drafts"]')?.textContent).toContain('Drafts to review (2)');
  });

  it('keeps drafts out of the Drill', () => {
    mountApp(root, bankOf(drafts()), 'review', { now, storage });
    expect(root.querySelector('[data-action="drill"]')?.textContent).toContain('1 question');
  });

  it('records an Agree verdict with the reviewer answer and counts down', async () => {
    mountApp(root, bankOf(drafts()), 'review', { now, storage });
    await answerFirstDraft();
    expect(root.querySelector('[data-mark="calls"]')).not.toBeNull();
    click(root, '[data-action="agree"]');
    await flush();
    const v = load('review', storage).verdicts;
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ agreed: true, note: '', at: now() });
    expect(v[0]!.reviewerRuling?.calls).toEqual(['FOUL_AND_A_MISS']);
    location.hash = '';
    mountApp(root, bankOf(drafts()), 'review', { now, storage });
    expect(root.querySelector('[data-action="drafts"]')?.textContent).toContain('Drafts to review (1)');
  });

  it('needs a note before a Dispute can be recorded', async () => {
    mountApp(root, bankOf(drafts()), 'review', { now, storage });
    await answerFirstDraft();
    const dispute = root.querySelector<HTMLButtonElement>('[data-action="dispute"]')!;
    expect(dispute.disabled).toBe(true);
    const note = root.querySelector<HTMLTextAreaElement>('[data-dispute-note]')!;
    note.value = 'Cue-ball should be in-hand';
    note.dispatchEvent(new Event('input'));
    expect(dispute.disabled).toBe(false);
  });

  it('never creates spaced-repetition progress for drafts', async () => {
    mountApp(root, bankOf(drafts()), 'review', { now, storage });
    await answerFirstDraft();
    click(root, '[data-action="agree"]');
    expect(load('review', storage).progress).toEqual({});
  });

  it('asks for a verdict on a draft Judgement Call too', async () => {
    mountApp(root, bankOf([judgement({ status: 'draft' })]), 'review', { now, storage });
    click(root, '[data-action="drafts"]');
    await flush();
    click(root, '[data-action="show-considerations"]');
    click(root, '[data-action="agree"]');
    expect(load('review', storage).verdicts[0]).toMatchObject({ questionId: 'fam-201', agreed: true });
  });

  it('sends verdicts to Carl through the share sheet', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    mountApp(root, bankOf(drafts()), 'review', { now, storage, nav: { share } as unknown as Navigator });
    await answerFirstDraft();
    click(root, '[data-action="agree"]');
    location.hash = '';
    mountApp(root, bankOf(drafts()), 'review', { now, storage, nav: { share } as unknown as Navigator });
    click(root, '[data-action="send-verdicts"]');
    await flush();
    expect(share.mock.calls[0]![0].text).toContain('Ball On review verdicts for Carl.');
  });
});

describe('Learner build', () => {
  it('has no drafts route', async () => {
    mountApp(root, bankOf([scenario()]), 'learner', { now, storage });
    location.hash = '#/drafts';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await flush();
    expect(root.querySelector('.home')).not.toBeNull();
    expect(root.querySelector('[data-action="drafts"]')).toBeNull();
  });
});
