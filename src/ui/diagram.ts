// Top-down Table Diagram in Rulebook millimetres (S1 R1): portrait, Top Cushion at y=0, baulk at the bottom.
import type { BallColour, Diagram } from '../domain/types';

const NS = 'http://www.w3.org/2000/svg';
const WIDTH = 1778;
const LENGTH = 3569;
const CUSHION = 70;
const BALL_R = 26.25;
const POCKET_R = 52;
const BAULK_Y = LENGTH - 737;
const D_RADIUS = 292;
const CENTRE_X = WIDTH / 2;

type SpotColour = 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';
export const SPOTS: Record<SpotColour, { x: number; y: number }> = {
  black: { x: CENTRE_X, y: 324 },
  pink: { x: CENTRE_X, y: LENGTH / 4 },
  blue: { x: CENTRE_X, y: LENGTH / 2 },
  brown: { x: CENTRE_X, y: BAULK_Y },
  yellow: { x: CENTRE_X + D_RADIUS, y: BAULK_Y }, // right of the D, viewed from the baulk end
  green: { x: CENTRE_X - D_RADIUS, y: BAULK_Y },
};

// Palette from the snooker-table-diagram skill (references/base-table.md).
const FILL: Record<BallColour, [fill: string, stroke: string]> = {
  red: ['#cc1111', '#991010'],
  yellow: ['#cccc00', '#aaaa00'],
  green: ['#00aa44', '#008833'],
  brown: ['#7a4a1a', '#5a3510'],
  blue: ['#2266cc', '#1855aa'],
  pink: ['#e84a8a', '#c03a70'],
  black: ['#1a1a1a', '#444444'],
  white: ['#f0f0e8', '#bbbbbb'],
};

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function describe(d: Diagram): string {
  if (d.caption) return `Table diagram: ${d.caption}`;
  const counts = new Map<BallColour, number>();
  for (const b of d.balls) counts.set(b.ball, (counts.get(b.ball) ?? 0) + 1);
  const parts = [...counts].map(([ball, n]) => (n > 1 ? `${n} ${ball}s` : ball));
  return `Table diagram with ${parts.join(', ')}`;
}

export function renderDiagram(d: Diagram): SVGSVGElement {
  const half = LENGTH / 2;
  const [top, height] =
    d.view === 'top' ? [-CUSHION, half + 2 * CUSHION]
    : d.view === 'bottom' ? [half - CUSHION, half + 2 * CUSHION]
    : [-CUSHION, LENGTH + 2 * CUSHION];
  const svg = el('svg', {
    viewBox: `${-CUSHION} ${top} ${WIDTH + 2 * CUSHION} ${height}`,
    class: `table-diagram view-${d.view ?? 'full'}`,
    role: 'img',
    'aria-label': describe(d),
  });
  svg.append(
    el('rect', { x: -CUSHION, y: -CUSHION, width: WIDTH + 2 * CUSHION, height: LENGTH + 2 * CUSHION, rx: 40, fill: '#4a2c17' }),
    el('rect', { x: 0, y: 0, width: WIDTH, height: LENGTH, fill: '#1f7a3f' }),
    el('line', { x1: 0, y1: BAULK_Y, x2: WIDTH, y2: BAULK_Y, stroke: '#ffffff', 'stroke-opacity': 0.35, 'stroke-width': 6 }),
    el('path', {
      d: `M ${CENTRE_X - D_RADIUS} ${BAULK_Y} A ${D_RADIUS} ${D_RADIUS} 0 0 0 ${CENTRE_X + D_RADIUS} ${BAULK_Y}`,
      fill: 'none', stroke: '#ffffff', 'stroke-opacity': 0.35, 'stroke-width': 6,
    }),
  );
  for (const [x, y] of [[0, 0], [WIDTH, 0], [0, LENGTH / 2], [WIDTH, LENGTH / 2], [0, LENGTH], [WIDTH, LENGTH]] as const) {
    svg.append(el('circle', { cx: x, cy: y, r: POCKET_R, fill: '#111111', class: 'pocket' }));
  }
  const occupied = (s: { x: number; y: number }) => d.balls.some((b) => Math.hypot(b.x - s.x, b.y - s.y) < BALL_R);
  for (const s of Object.values(SPOTS)) {
    if (!occupied(s)) svg.append(el('circle', { cx: s.x, cy: s.y, r: 9, fill: '#ffffff', 'fill-opacity': 0.5, class: 'spot' }));
  }
  for (const b of d.balls) {
    const [fill, stroke] = FILL[b.ball];
    svg.append(el('circle', { cx: b.x, cy: b.y, r: BALL_R, fill, stroke, 'stroke-width': 4, class: `ball ball-${b.ball}` }));
  }
  return svg;
}
