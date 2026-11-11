import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountApp } from '../../src/ui/app';
import { load, storageKey } from '../../src/storage/store';
import { scenario } from '../fixtures/questions';
import { bankOf, click, flush, MemoryStorage } from './helpers';

const now = () => Date.UTC(2026, 10, 11, 12);
let root: HTMLElement;
let storage: MemoryStorage;
const withFlag = { version: 1, progress: {}, verdicts: [], flags: [{ questionId: 'fam-001', note: 'Unclear', at: 1 }] };

beforeEach(() => {
  location.hash = '#/settings';
  document.body.innerHTML = '<main id="app"></main>';
  root = document.getElementById('app')!;
  storage = new MemoryStorage();
  storage.setItem(storageKey('learner'), JSON.stringify(withFlag));
});

const mount = (nav: Partial<Navigator>) =>
  mountApp(root, bankOf([scenario()]), 'learner', { now, storage, nav: nav as Navigator });

describe('Settings', () => {
  it('sends flags to Rani and clears them once shared', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    mount({ share });
    expect(root.querySelector('[data-action="send-flags"]')?.textContent).toContain('Send flags to Rani (1)');
    click(root, '[data-action="send-flags"]');
    await flush();
    expect(share.mock.calls[0]![0].text).toContain('Ball On flags. Please send to Rani.');
    expect(load('learner', storage).flags).toEqual([]);
  });

  it('tells the Learner when flags were copied instead of shared', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mount({ clipboard: { writeText } as unknown as Clipboard });
    click(root, '[data-action="send-flags"]');
    await flush();
    expect(root.textContent).toContain('Flags copied');
  });

  it('attaches the backup link to the page and revokes its URL later', () => {
    vi.useFakeTimers();
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup');
    const connected: boolean[] = [];
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      connected.push(this.isConnected);
    });
    mount({});
    click(root, '[data-action="backup"]');
    expect(connected).toEqual([true]);
    expect(revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith('blob:backup');
    clickSpy.mockRestore();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('keeps flags when the share is cancelled', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('x', 'AbortError'));
    mount({ share });
    click(root, '[data-action="send-flags"]');
    await flush();
    expect(load('learner', storage).flags).toHaveLength(1);
  });

  it('rejects a bad backup file without touching data', async () => {
    mount({});
    const input = root.querySelector<HTMLInputElement>('[data-action="restore"]')!;
    Object.defineProperty(input, 'files', { value: [new File(['not a backup'], 'x.json', { type: 'application/json' })] });
    input.dispatchEvent(new Event('change'));
    await flush();
    await flush();
    expect(root.textContent).toContain("isn't a Ball On backup");
    expect(load('learner', storage).flags).toHaveLength(1);
  });

  it('restores a valid backup after confirmation', async () => {
    vi.stubGlobal('confirm', () => true);
    mount({});
    const backup = JSON.stringify({ version: 1, progress: { 'fam-001': { box: 3, due: 5, seen: 4 } }, flags: [], verdicts: [] });
    const input = root.querySelector<HTMLInputElement>('[data-action="restore"]')!;
    Object.defineProperty(input, 'files', { value: [new File([backup], 'b.json', { type: 'application/json' })] });
    input.dispatchEvent(new Event('change'));
    await flush();
    await flush();
    expect(load('learner', storage).progress['fam-001']?.box).toBe(3);
    vi.unstubAllGlobals();
  });

  it('credits the Rulebook edition', () => {
    mount({});
    expect(root.textContent).toContain('WPBSA Official Rules (revised September 2024)');
  });
});
