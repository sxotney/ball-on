import { describe, expect, it } from 'vitest';
import { flagsMessage, verdictsMessage } from '../../src/share/messages';
import type { Verdict } from '../../src/storage/store';
import { recall, scenario } from '../fixtures/questions';

const topics = [{ slug: 'foul-and-a-miss', title: 'Foul and a Miss' }];

describe('flagsMessage', () => {
  it('addresses Rani and lists every flag with its note', () => {
    const text = flagsMessage(
      [{ questionId: 'fam-001', note: 'Is the cue ball right?', at: 1 }, { questionId: 'fam-101', note: 'Typo', at: 2 }],
      [scenario(), recall()],
      topics,
    );
    expect(text.split('\n')[0]).toBe('Ball On flags. Please send to Rani.');
    expect(text).toContain('fam-001 (Foul and a Miss): Reds remain.');
    expect(text).toContain('Note: Is the cue ball right?');
    expect(text).toContain('fam-101');
    expect(text).toContain('Note: Typo');
  });
  it('still lists a flag whose question has gone', () => {
    expect(flagsMessage([{ questionId: 'gone-1', note: 'x', at: 1 }], [], topics)).toContain('gone-1');
  });
});

describe('verdictsMessage', () => {
  const verdicts: Verdict[] = [
    { questionId: 'fam-001', agreed: true, note: '', at: 1 },
    { questionId: 'fam-002', agreed: false, note: 'Penalty should be 7', at: 2 },
  ];
  it('addresses Carl, summarises and lists disputes', () => {
    const text = verdictsMessage(verdicts);
    expect(text.split('\n')[0]).toBe('Ball On review verdicts for Carl.');
    expect(text).toContain('Agreed: 1, Disputed: 1');
    expect(text).toContain('fam-002: Penalty should be 7');
  });
  it('embeds the verdicts as a JSON block that parses back', () => {
    const block = /```json\n([\s\S]*?)\n```/.exec(verdictsMessage(verdicts));
    expect(JSON.parse(block![1]!)).toEqual(verdicts);
  });
});
