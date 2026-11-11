import { describe, expect, it } from 'vitest';
import { isValidCitation, parseCitation } from '../../src/domain/citation';

describe('parseCitation', () => {
  it('parses section, rule and nested parts', () => {
    expect(parseCitation('S3 R14(d)(ii)')).toEqual({ section: 3, rule: 14, parts: ['d', 'ii'] });
  });
  it('parses a bare rule', () => {
    expect(parseCitation('S2 R17')).toEqual({ section: 2, rule: 17, parts: [] });
  });
});

describe('isValidCitation', () => {
  it('accepts the last rule of a section', () => expect(isValidCitation('S3 R21')).toBe(true));
  it.each(['S3 R22', 'S6 R1', 'S1 R5', 's3 r14', 'S3 R14(D)', '', 'S3 R0', 'S3 R14(ii)', 'S3 R14(d)(e)'])(
    'rejects %j',
    (s) => expect(isValidCitation(s)).toBe(false),
  );
});
