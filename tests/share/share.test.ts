import { describe, expect, it, vi } from 'vitest';
import { shareText } from '../../src/share/share';

const nav = (n: Partial<Navigator>) => n as Navigator;

describe('shareText', () => {
  it('uses the share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    expect(await shareText('T', 'body', nav({ share }))).toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'T', text: 'body' });
  });
  it('treats a cancelled share as cancelled, not failed', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    expect(await shareText('T', 'body', nav({ share }))).toBe('cancelled');
  });
  it('falls back to the clipboard without a share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareText('T', 'body', nav({ clipboard: { writeText } as unknown as Clipboard }))).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('body');
  });
  it('falls back to the clipboard when sharing errors for another reason', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('no', 'NotAllowedError'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareText('T', 'body', nav({ share, clipboard: { writeText } as unknown as Clipboard }))).toBe('copied');
  });
  it('fails with neither', async () => expect(await shareText('T', 'body', nav({}))).toBe('failed'));
});
