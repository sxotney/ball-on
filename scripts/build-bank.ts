// Validates questions/*.json and writes src/generated/bank.json for one build mode.
// The learner bank keeps Reviewed questions only, so Drafts never reach the Learner app (ADR 0005).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateOptionsList, validateQuestion } from '../src/domain/validate';
import type { Bank, OptionDef, Question, Topic } from '../src/domain/types';

export type Mode = 'learner' | 'review';
const RESERVED = new Set(['options-list.json', 'topics.json']);

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));

export function buildBank(dir: string, mode: Mode): Bank {
  const errors: string[] = [];
  const options = readJson(join(dir, 'options-list.json'));
  errors.push(...validateOptionsList(options));
  const topics = readJson(join(dir, 'topics.json')) as Topic[];
  const topicSlugs = new Set(topics.map((t) => t.slug));
  const optionIds = new Set((Array.isArray(options) ? options : []).map((o: OptionDef) => o.id));

  const questions: Question[] = [];
  const firstSeenIn = new Map<string, string>();
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !RESERVED.has(f)).sort();
  for (const file of files) {
    const content = readJson(join(dir, file)) as { topic?: unknown; questions?: unknown };
    if (!Array.isArray(content.questions)) { errors.push(`${file}: must have a questions list`); continue; }
    for (const q of content.questions as Question[]) {
      const qErrors = validateQuestion(q, optionIds, topicSlugs);
      if (q && q.topic !== content.topic) qErrors.push(`${q.id}: topic: ${q.topic} does not match file topic ${String(content.topic)}`);
      errors.push(...qErrors.map((e) => `${file}: ${e}`));
      const earlier = firstSeenIn.get(q.id);
      if (earlier) errors.push(`duplicate id ${q.id} in ${earlier} and ${file}`);
      else firstSeenIn.set(q.id, file);
      if (qErrors.length === 0 && (mode === 'review' || q.status === 'reviewed')) questions.push(q);
    }
  }
  if (errors.length > 0) throw new Error(`Question bank is invalid:\n${errors.join('\n')}`);
  return { topics, options: options as OptionDef[], questions };
}

function main(): void {
  const mode = process.argv[2];
  if (mode !== 'learner' && mode !== 'review') {
    console.error('usage: build-bank <learner|review>');
    process.exit(2);
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const dir = process.env.BALL_ON_QUESTIONS_DIR ?? join(root, 'questions');
  try {
    const bank = buildBank(dir, mode);
    const out = join(root, 'src', 'generated', 'bank.json');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(bank));
    console.log(`bank (${mode}): ${bank.questions.length} questions, ${bank.topics.length} topics -> src/generated/bank.json`);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
