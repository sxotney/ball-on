import type { Bank, Question } from '../../src/domain/types';

export class MemoryStorage implements Storage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, v); }
}

export const bankOf = (questions: Question[]): Bank => ({
  topics: [{ slug: 'foul-and-a-miss', title: 'Foul and a Miss' }, { slug: 'free-ball', title: 'Free Ball' }],
  options: [
    { id: 'PLAY_FROM_POSITION_LEFT', label: 'Play the next stroke from the position left', citation: 'S3 R10(f)' },
    { id: 'OFFENDER_AGAIN_POSITION_LEFT', label: 'Ask the offender to play again from the position left', citation: 'S3 R10(h)(ii)' },
    { id: 'OFFENDER_AGAIN_ORIGINAL', label: 'Ask the offender to play again, balls replaced', citation: 'S3 R14(b)' },
  ],
  questions,
});

export function click(root: ParentNode, selector: string): void {
  const node = root.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`nothing matches ${selector}\n${(root as Element).innerHTML ?? ''}`);
  node.click();
}

export const flush = () => new Promise((r) => setTimeout(r, 0));
