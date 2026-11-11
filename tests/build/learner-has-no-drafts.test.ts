// ADR 0005: Drafts must not exist anywhere in the Learner app's output files.
import { execSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scenario } from '../fixtures/questions';

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? filesUnder(p) : [p];
  });

describe('learner build', () => {
  it('contains no draft questions', () => {
    const questions = mkdtempSync(join(tmpdir(), 'ball-on-q-'));
    cpSync('questions/options-list.json', join(questions, 'options-list.json'));
    cpSync('questions/topics.json', join(questions, 'topics.json'));
    writeFileSync(join(questions, 'foul-and-a-miss.json'), JSON.stringify({
      topic: 'foul-and-a-miss',
      questions: [
        scenario({ id: 'zz-draft-sentinel', status: 'draft', prompt: 'DRAFT-PROMPT-SENTINEL' }),
        scenario({ id: 'zz-reviewed-sentinel', status: 'reviewed' }),
      ],
    }));
    const outDir = mkdtempSync(join(tmpdir(), 'ball-on-dist-'));
    execSync('npm run -s build:learner', {
      env: { ...process.env, BALL_ON_QUESTIONS_DIR: questions, BALL_ON_OUT_DIR: outDir },
      stdio: 'pipe',
    });
    const contents = filesUnder(outDir).map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(contents).toContain('zz-reviewed-sentinel');
    expect(contents).not.toContain('zz-draft-sentinel');
    expect(contents).not.toContain('DRAFT-PROMPT-SENTINEL');
    expect(filesUnder(outDir).some((f) => f.endsWith('manifest.webmanifest'))).toBe(true);
  }, 120_000);
});
