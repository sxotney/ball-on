// App shell: state, persistence and hash routing.
import { buildDrill, topicSession } from '../domain/drill';
import type { Bank } from '../domain/types';
import { load, save, type BuildMode } from '../storage/store';
import type { Ctx } from './context';
import { renderHome } from './screens/home';
import { renderSession, startSession } from './screens/session';

export interface AppDeps { now?: () => number; storage?: Storage; nav?: Navigator; rng?: () => number }

export interface Route { match: (hash: string) => boolean; render: (el: HTMLElement, ctx: Ctx, hash: string) => void }

export function mountApp(root: HTMLElement, bank: Bank, mode: BuildMode, deps: AppDeps = {}, extraRoutes: Route[] = []): Ctx {
  const storage = deps.storage ?? (() => { try { return localStorage; } catch { return undefined; } })();
  let rendered = '';
  const ctx: Ctx = {
    bank,
    mode,
    data: load(mode, storage),
    now: deps.now ?? Date.now,
    rng: deps.rng ?? Math.random,
    nav: deps.nav ?? navigator,
    session: null,
    persist: () => save(mode, ctx.data, storage),
    go: (hash) => {
      if (location.hash !== hash) location.hash = hash;
      render(hash);
    },
  };

  const routes: Route[] = [
    ...extraRoutes,
    {
      match: (hash) => hash === '#/drill',
      render: (el) => {
        const s = ctx.session?.route === '#/drill' ? ctx.session
          : startSession(ctx, '#/drill', "Today's Drill", buildDrill(bank.questions, ctx.data.progress, ctx.now(), ctx.rng));
        renderSession(el, ctx, s);
      },
    },
    {
      match: (hash) => hash.startsWith('#/topic/'),
      render: (el, _ctx, hash) => {
        const slug = hash.slice('#/topic/'.length);
        const topic = bank.topics.find((t) => t.slug === slug);
        if (!topic) return renderHome(el, ctx);
        const s = ctx.session?.route === hash ? ctx.session : startSession(ctx, hash, topic.title, topicSession(bank.questions, slug, ctx.rng));
        renderSession(el, ctx, s);
      },
    },
  ];

  function render(hash: string): void {
    rendered = hash;
    const route = routes.find((r) => r.match(hash));
    if (route) route.render(root, ctx, hash);
    else renderHome(root, ctx);
    window.scrollTo?.(0, 0);
  }

  window.addEventListener('hashchange', () => { if (location.hash !== rendered) render(location.hash); });
  render(location.hash);
  return ctx;
}
