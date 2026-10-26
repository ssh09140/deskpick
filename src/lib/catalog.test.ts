import { describe, expect, it } from 'vitest';
import { products, productById, parseSetup, emptySetup } from './desk';

describe('published catalogue and legacy saved layouts', () => {
  it('only publishes sourced real products with usable links and dimensions', () => {
    expect(products.length).toBeGreaterThanOrEqual(12);
    expect(new Set(products.map(p => p.cat)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(products.map(p => p.id)).size).toBe(products.length);
    for (const p of products) {
      expect(p.sample).toBe(false);
      expect(new URL(p.seller_url!).hostname).toBe('www.ikea.com');
      expect(p.seller_url).toContain(p.manufacturer_code);
      expect(p.price_checked_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.w).toBeGreaterThan(0);
      expect(p.d).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
    }
  });
  it('keeps old sample layouts intact without advertising them as real products', () => {
    const old = productById.get('wood-stand')!;
    expect([old.w, old.d, old.price, old.sample]).toEqual([550, 220, 39000, true]);
    expect(products.some(p => p.id === old.id)).toBe(false);
    const setup = { ...emptySetup(), items: [{ instance_id: 'saved-instance', product_id: old.id, x_mm: 123.5, y_mm: 20 }] };
    expect(parseSetup(setup)).toEqual(setup);
  });
});
