import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { applyDeskSize, newPlacement, parseSetup, products, emptySetup, type DeskSetup } from '../lib/desk';
import { DeskPreview } from './DeskPreview';

const render = (setup: DeskSetup) => renderToStaticMarkup(createElement(DeskPreview, { setup }));

it('shows an empty desk when the editor has no products', () => {
  const html = render(emptySetup());
  expect(html).toContain('제품 0개');
  expect(html).not.toMatch(/dp-baffle|dp-cap|MR4 · Halo 예시/);
});

it('places the active and passive MR4 cabinets at their own rotated footprint centers', () => {
  const html = render({
    desk_width_mm: 1000, desk_depth_mm: 600,
    items: [
      { instance_id: 'a', product_id: 'edifier-mr4', x_mm: 10, y_mm: 30, rotation: 90 },
      { instance_id: 'p', passive_of: 'a', product_id: 'edifier-mr4', x_mm: 670, y_mm: 85 },
    ],
  });
  expect(html).toContain('translate3d(-391.25px,0px,-200px) rotateY(-90deg)');
  expect(html).toContain('translate3d(240px,0px,-123px) rotateY(0deg)');
  expect(html.match(/class="dp-baffle"/g)).toHaveLength(2);
  expect(html).not.toContain('dp-cap');
});

it.each(products)('renders the current catalog model $id with its stored layout', product => {
  const setup = emptySetup();
  if (product.type === 'desk') {
    const restored = parseSetup(JSON.parse(JSON.stringify(applyDeskSize(setup, product))));
    expect(restored.desk_product_id).toBe(product.id);
    expect(render(restored)).toContain(product.name);
    return;
  }
  setup.items = newPlacement(product, setup);
  const html = render(setup);
  if (product.type === 'monitor-light') {
    expect(html.includes('dp-screen-guide')).toBe(product.id !== 'benq-screenbar-max');
  }
  expect(html).not.toContain('class="dp-marker"');
  expect(html).not.toMatch(/NaN|Infinity/);
  expect(html).toContain('dp-face');
});
