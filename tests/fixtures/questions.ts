import type { JudgementCall, Recall, Scenario } from '../../src/domain/types';

export const OPTION_IDS = new Set(['PLAY_FROM_POSITION_LEFT', 'OFFENDER_AGAIN_POSITION_LEFT', 'OFFENDER_AGAIN_ORIGINAL']);
export const TOPICS = new Set(['foul-and-a-miss', 'free-ball']);

export const scenario = (over: Partial<Scenario> = {}): Scenario => ({
  id: 'fam-001',
  topic: 'foul-and-a-miss',
  edition: '2024-09',
  status: 'reviewed',
  kind: 'scenario',
  citations: ['S3 R14(c)'],
  prompt: 'Reds remain. Clear path to a red; the striker misses everything.',
  ruling: {
    calls: ['FOUL_AND_A_MISS'],
    penaltyPoints: 4,
    options: ['PLAY_FROM_POSITION_LEFT', 'OFFENDER_AGAIN_POSITION_LEFT', 'OFFENDER_AGAIN_ORIGINAL'],
    cueBall: 'WHERE_IT_LIES',
  },
  explanation: 'A clear path to the ball on means a miss must be called.',
  ...over,
});

export const recall = (over: Partial<Recall> = {}): Recall => ({
  id: 'fam-101',
  topic: 'foul-and-a-miss',
  edition: '2024-09',
  status: 'reviewed',
  kind: 'recall',
  citations: ['S3 R11(a)(x)'],
  prompt: 'Penalty for a jump shot when the black is the ball on?',
  answer: { type: 'number', value: 7 },
  explanation: 'Value of the ball on.',
  ...over,
});

export const judgement = (over: Partial<JudgementCall> = {}): JudgementCall => ({
  id: 'fam-201',
  topic: 'foul-and-a-miss',
  edition: '2024-09',
  status: 'reviewed',
  kind: 'judgement',
  citations: ['S3 R14(a)(i)'],
  prompt: 'Was that a genuine attempt?',
  considerations: 'Pace, angle, and whether the striker needed snookers.',
  ...over,
});
