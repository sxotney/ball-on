// Text that leaves the phone through the share sheet (ADR 0004).
import type { Question, Topic } from '../domain/types';
import type { Flag, Verdict } from '../storage/store';

const PROMPT_PREVIEW = 80;

export function flagsMessage(flags: Flag[], questions: Question[], topics: Topic[]): string {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const titles = new Map(topics.map((t) => [t.slug, t.title]));
  const blocks = flags.map((f) => {
    const q = byId.get(f.questionId);
    const head = q
      ? `${q.id} (${titles.get(q.topic) ?? q.topic}): ${q.prompt.slice(0, PROMPT_PREVIEW)}`
      : `${f.questionId} (question no longer in the app)`;
    return `${head}\nNote: ${f.note || '(no note)'}`;
  });
  return ['Ball On flags. Please send to Rani.', '', ...blocks.flatMap((b) => [b, ''])].join('\n').trimEnd();
}

export function verdictsMessage(verdicts: Verdict[]): string {
  const agreed = verdicts.filter((v) => v.agreed).length;
  const disputes = verdicts.filter((v) => !v.agreed).map((v) => `- ${v.questionId}: ${v.note}`);
  return [
    'Ball On review verdicts for Carl.',
    `Agreed: ${agreed}, Disputed: ${verdicts.length - agreed}`,
    ...(disputes.length ? ['', 'Disputes:', ...disputes] : []),
    '',
    '```json',
    JSON.stringify(verdicts),
    '```',
  ].join('\n');
}
