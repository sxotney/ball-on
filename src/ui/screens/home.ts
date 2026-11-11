import { buildDrill } from '../../domain/drill';
import type { Ctx } from '../context';
import { h } from '../dom';

export function renderHome(el: HTMLElement, ctx: Ctx, extras: HTMLElement[] = []): void {
  const { questions, topics } = ctx.bank;
  const body: (HTMLElement | false)[] = [h('h1', {}, 'Ball On'), ...extras];
  if (questions.length === 0) {
    body.push(h('p', { class: 'empty' }, 'No reviewed questions yet. Rani is still checking them.'));
  } else {
    const ready = buildDrill(questions, ctx.data.progress, ctx.now(), ctx.rng).length;
    body.push(ready > 0
      ? h('button', { type: 'button', class: 'primary drill', 'data-action': 'drill', onclick: () => { ctx.session = null; ctx.go('#/drill'); } },
          "Today's Drill", h('span', { class: 'count' }, `${ready} question${ready === 1 ? '' : 's'}`))
      : h('p', { class: 'empty' }, 'Nothing due. Practise a Topic.'));
    const withCounts = topics
      .map((t) => ({ t, n: questions.filter((q) => q.topic === t.slug).length }))
      .filter(({ n }) => n > 0);
    body.push(h('h2', {}, 'Topic practice'), h('ul', { class: 'topics' }, withCounts.map(({ t, n }) =>
      h('li', {}, h('button', {
        type: 'button', class: 'topic', 'data-topic': t.slug,
        onclick: () => { ctx.session = null; ctx.go(`#/topic/${t.slug}`); },
      }, t.title, h('span', { class: 'count' }, String(n)))))));
  }
  body.push(h('nav', { class: 'footer' }, h('a', { href: '#/settings', 'data-action': 'settings' }, 'Settings')));
  el.replaceChildren(h('section', { class: 'home' }, ...body.filter((b): b is HTMLElement => b !== false)));
}
