// Flags out to Rani, backup and restore, and where the rulings come from.
import { flagsMessage } from '../../share/messages';
import { shareText } from '../../share/share';
import { exportJson, importJson } from '../../storage/store';
import type { Ctx } from '../context';
import { h } from '../dom';

export function renderSettings(el: HTMLElement, ctx: Ctx): void {
  const status = h('p', { class: 'note', role: 'status' });
  const say = (text: string) => { status.textContent = text; };
  const flags = ctx.data.flags.length;

  const sendFlags = h('button', {
    type: 'button', class: 'primary', 'data-action': 'send-flags', disabled: flags === 0,
    onclick: async () => {
      const result = await shareText('Ball On flags', flagsMessage(ctx.data.flags, ctx.bank.questions, ctx.bank.topics), ctx.nav);
      if (result === 'shared' || result === 'copied') {
        ctx.data.flags = [];
        ctx.persist();
        renderSettings(el, ctx);
        return say(result === 'copied' ? 'Flags copied. Paste them into a message to Rani.' : 'Flags sent.');
      }
      if (result === 'failed') say("Couldn't share or copy the flags on this device.");
    },
  }, `Send flags to Rani (${flags})`);

  const backup = h('button', {
    type: 'button', class: 'secondary', 'data-action': 'backup',
    onclick: () => {
      const blob = new Blob([exportJson(ctx.data)], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `ball-on-backup-${new Date(ctx.now()).toISOString().slice(0, 10)}.json` });
      a.click();
      URL.revokeObjectURL(a.href);
      say('Backup saved to your downloads.');
    },
  }, 'Back up progress');

  const restore = h('input', {
    type: 'file', accept: 'application/json,.json', 'data-action': 'restore', 'aria-label': 'Restore from backup',
    onchange: async (e) => {
      const file = (e.currentTarget as HTMLInputElement).files?.[0];
      if (!file) return;
      const result = importJson(await file.text());
      if (!result.ok) return say(result.error);
      if (!confirm('Replace your progress on this phone with the backup?')) return;
      ctx.data = result.data;
      ctx.persist();
      say('Backup restored.');
    },
  });

  el.replaceChildren(h('section', { class: 'settings' },
    h('h1', {}, 'Settings'),
    h('h2', {}, 'Flags'),
    h('p', {}, 'Questions you flagged as wrong or unclear are collected here so you can send them to Rani in one message.'),
    sendFlags,
    h('h2', {}, 'Backup'),
    h('p', {}, 'Your progress is stored only on this phone. Back it up before changing phones.'),
    backup,
    h('label', { class: 'restore' }, h('span', {}, 'Restore from backup'), restore),
    status,
    h('h2', {}, 'About'),
    h('p', {}, 'Based on the WPBSA Official Rules (revised September 2024). Explanations are our own words. Check the cited rule in your copy of the Rulebook.'),
    h('nav', { class: 'footer' }, h('a', { href: '#/' }, 'Home')),
  ));
}
