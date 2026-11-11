import { describe, expect, it } from 'vitest';
import { renderDiagram, SPOTS } from '../../src/ui/diagram';

describe('renderDiagram', () => {
  const svg = renderDiagram({
    balls: [{ ball: 'white', x: 889, y: 400 }, { ball: 'black', x: 889, y: 324 }],
    caption: 'White just below the black',
  });
  const balls = svg.querySelectorAll('circle.ball');

  it('draws one circle per ball at its coordinates', () => {
    expect(balls).toHaveLength(2);
    expect(balls[0]!.getAttribute('cx')).toBe('889');
    expect(balls[0]!.getAttribute('cy')).toBe('400');
    expect(balls[0]!.getAttribute('r')).toBe('26.25');
  });
  it('marks spots that have no ball on them', () => {
    expect(svg.querySelectorAll('circle.spot')).toHaveLength(5); // black is occupied
  });
  it('is labelled for screen readers with the caption', () => {
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toContain('White just below the black');
  });
  it('describes the balls when no caption is given', () => {
    const plain = renderDiagram({ balls: [{ ball: 'red', x: 100, y: 100 }] });
    expect(plain.getAttribute('aria-label')).toContain('red');
  });
  it('puts yellow on the right of the D, viewed from baulk', () => {
    expect(SPOTS.yellow.x).toBeGreaterThan(SPOTS.green.x);
    expect(SPOTS.brown.y).toBeGreaterThan(SPOTS.blue.y);
  });
});

describe('half-table views', () => {
  const height = (svg: SVGSVGElement) => Number(svg.getAttribute('viewBox')!.split(' ')[3]);
  it('crops to the top half', () => {
    const full = renderDiagram({ balls: [] });
    const top = renderDiagram({ balls: [], view: 'top' });
    expect(height(top)).toBeLessThan(height(full) * 0.6);
    expect(Number(top.getAttribute('viewBox')!.split(' ')[1])).toBeLessThan(0);
  });
  it('crops to the baulk half', () => {
    const bottom = renderDiagram({ balls: [], view: 'bottom' });
    expect(Number(bottom.getAttribute('viewBox')!.split(' ')[1])).toBeGreaterThan(1500);
  });
});
