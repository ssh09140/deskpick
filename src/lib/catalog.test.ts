import { describe, expect, it } from 'vitest';
import { products, productById, parseSetup, emptySetup, applyDeskSize, placeableProducts } from './desk';

describe('published catalogue and legacy saved layouts', () => {
  it('only publishes sourced real products with usable links and dimensions', () => {
    expect(products.length).toBeGreaterThanOrEqual(6);
    expect(new Set(products.map(p => p.cat)).size).toBe(5);
    expect(products.some(p => /^(ikea|apple)-/.test(p.id))).toBe(false);
    expect(new Set(products.map(p => p.id)).size).toBe(products.length);
    for (const p of products) {
      expect(p.sample).toBe(false);
      expect(['www.ikea.com', 'www.apple.com', 'www.camelmountmall.com', 'ilian.cafe24.com', 'www.11st.co.kr', 'item.gmarket.co.kr', 'itempage3.auction.co.kr', 'vertitap.com', 'futureterior.com', 'choetech.kr']).toContain(new URL(p.seller_url!).hostname);
      expect(new URL(p.seller_url!).protocol).toBe('https:');
      if (p.id.startsWith('fiture-')) expect(new URL(p.seller_url!).searchParams.get('goodsNo')).toMatch(/^100000\d+$/);
      else if (p.id.startsWith('ilian-')) expect(new URL(p.seller_url!).pathname).toMatch(/\/(32|33)\//);
      else if (p.id.startsWith('edifier-')) expect(p.image_source_url).toContain(p.id.replace('edifier-', ''));
      else if (p.id.startsWith('vertitap-')) expect(new URL(p.seller_url!).pathname).toMatch(/\/product\/vertical-(basic|ultra65|ultra100)\/\d+\//);
      else if (p.type === 'monitor-light') expect(p.image_source_url).toMatch(/^https:\/\//);
      else expect(p.seller_url!.toLowerCase()).toContain(p.manufacturer_code!.toLowerCase().split('/')[0]);
      expect(p.price_checked_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.w).toBeGreaterThan(0);
      expect(p.d).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
    }
  });
  it('applies desk dimensions without adding a desk to the surface or losing placed items', () => {
    const item = { instance_id: 'keep', product_id: 'ikea-80474783', x_mm: 50, y_mm: 100 };
    const setup = { ...emptySetup(), items: [item] };
    const desk = productById.get('fiture-e2-1400-white')!;
    const next = applyDeskSize(setup, desk);
    expect([next.desk_width_mm, next.desk_depth_mm]).toEqual([1400, 750]);
    expect(next.items).toEqual([item]);
    expect(setup.desk_depth_mm).toBe(800);
    expect(placeableProducts.some(p => p.type === 'desk')).toBe(false);
    expect(() => applyDeskSize(setup, productById.get(item.product_id)!)).toThrow();
  });
  it('keeps old sample layouts intact without advertising them as real products', () => {
    const old = productById.get('wood-stand')!;
    expect([old.w, old.d, old.price, old.sample]).toEqual([550, 220, 39000, true]);
    expect(products.some(p => p.id === old.id)).toBe(false);
    const setup = { ...emptySetup(), items: [{ instance_id: 'saved-instance', product_id: old.id, x_mm: 123.5, y_mm: 20 }] };
    expect(parseSetup(setup)).toEqual(setup);
  });
});
