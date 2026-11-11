import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildBank } from '../../scripts/build-bank';
import { scenario } from '../fixtures/questions';

function fixtureDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), 'ball-on-bank-'));
  const base = {
    'options-list.json': [
      { id: 'PLAY_FROM_POSITION_LEFT', label: 'Play on', citation: 'S3 R10(f)' },
      { id: 'OFFENDER_AGAIN_POSITION_LEFT', label: 'Again, left', citation: 'S3 R10(h)(ii)' },
      { id: 'OFFENDER_AGAIN_ORIGINAL', label: 'Again, replaced', citation: 'S3 R14(b)' },
    ],
    'topics.json': [{ slug: 'foul-and-a-miss', title: 'Foul and a Miss' }],
  };
  for (const [name, content] of Object.entries({ ...base, ...files })) {
    writeFileSync(join(dir, name), JSON.stringify(content));
  }
  return dir;
}

const twoQuestions = {
  'foul-and-a-miss.json': {
    topic: 'foul-and-a-miss',
    questions: [scenario({ id: 'fam-001', status: 'reviewed' }), scenario({ id: 'fam-002', status: 'draft' })],
  },
};

describe('buildBank', () => {
  it('keeps only reviewed questions for the learner build', () => {
    const bank = buildBank(fixtureDir(twoQuestions), 'learner');
    expect(bank.questions.map((q) => q.id)).toEqual(['fam-001']);
    expect(bank.topics).toEqual([{ slug: 'foul-and-a-miss', title: 'Foul and a Miss' }]);
    expect(bank.options).toHaveLength(3);
  });

  it('keeps drafts too for the review build', () => {
    const bank = buildBank(fixtureDir(twoQuestions), 'review');
    expect(bank.questions.map((q) => q.id)).toEqual(['fam-001', 'fam-002']);
  });

  it('throws on duplicate ids across files, naming both files', () => {
    const dir = fixtureDir({
      ...twoQuestions,
      'other.json': { topic: 'foul-and-a-miss', questions: [scenario({ id: 'fam-001' })] },
    });
    expect(() => buildBank(dir, 'review')).toThrow(/fam-001.*foul-and-a-miss\.json.*other\.json|fam-001.*other\.json.*foul-and-a-miss\.json/s);
  });

  it('throws with the id of an invalid question', () => {
    const dir = fixtureDir({
      'foul-and-a-miss.json': { topic: 'foul-and-a-miss', questions: [scenario({ id: 'fam-009', citations: [] })] },
    });
    expect(() => buildBank(dir, 'review')).toThrow(/fam-009/);
  });

  it('throws when a question topic does not match its file topic', () => {
    const dir = fixtureDir({
      'foul-and-a-miss.json': { topic: 'foul-and-a-miss', questions: [scenario({ id: 'fam-010', topic: 'free-ball' })] },
    });
    expect(() => buildBank(dir, 'review')).toThrow(/fam-010/);
  });
});
