// Share sheet first, clipboard as the fallback (e.g. desktop browsers).
export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareText(title: string, text: string, nav: Navigator = navigator): Promise<ShareResult> {
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title, text });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    if (!nav.clipboard?.writeText) return 'failed';
    await nav.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
