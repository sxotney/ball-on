import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// Two builds from one codebase (ADR 0005): the Learner app at /ball-on/ and the Review build at /ball-on/review/.
export default defineConfig(({ mode }) => {
  const review = mode === 'review';
  const base = review ? '/ball-on/review/' : '/ball-on/';
  const outRoot = process.env.BALL_ON_OUT_DIR ?? 'dist';
  return {
    base,
    build: {
      outDir: review ? `${outRoot}/review` : outRoot,
      // The review build lands inside the learner output, so it mustn't wipe it.
      emptyOutDir: !review,
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          // The learner service worker's scope (/ball-on/) contains the review build's URL: never answer for it.
          globIgnores: review ? [] : ['review/**'],
          navigateFallbackDenylist: review ? [] : [/^\/ball-on\/review\//],
        },
        manifest: {
          name: review ? 'Ball On (Review)' : 'Ball On',
          short_name: review ? 'Ball On Review' : 'Ball On',
          description: 'Snooker referee revision: make the call.',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#f6f4ee',
          theme_color: '#1f7a3f',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
    test: { environment: 'happy-dom', include: ['tests/**/*.test.ts'] },
  };
});
