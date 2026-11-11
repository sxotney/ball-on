// Rule Citations, e.g. "S3 R14(d)(ii)": Section, Rule, then a lettered paragraph and roman sub-paragraphs.

/** Highest rule number in each Snooker section of the 2024-09 Rulebook. */
const MAX_RULE: Record<number, number> = { 1: 4, 2: 22, 3: 21, 4: 7, 5: 4 };

const SHAPE = /^S(\d) R(\d{1,2})((?:\([a-z]+\))*)$/;
const ROMAN = /^(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)$/;

export interface ParsedCitation { section: number; rule: number; parts: string[] }

export function parseCitation(s: string): ParsedCitation | null {
  const m = SHAPE.exec(s);
  if (!m) return null;
  const section = Number(m[1]);
  const rule = Number(m[2]);
  const parts = (m[3] ?? '').match(/[a-z]+/g) ?? [];
  return { section, rule, parts };
}

export function isValidCitation(s: string): boolean {
  const c = parseCitation(s);
  if (!c) return false;
  const max = MAX_RULE[c.section];
  if (max === undefined || c.rule < 1 || c.rule > max) return false;
  const [first, ...rest] = c.parts;
  if (first !== undefined && !/^[a-z]$/.test(first)) return false;
  return rest.every((p) => ROMAN.test(p));
}
