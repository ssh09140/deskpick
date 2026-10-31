import { describe, expect, it } from 'vitest';
import { products } from './desk';
import rawProducts from '../data/products.json';
import { catalogCategories, catalogOverrides, filterProducts, metadata, populatedChildren, readFilters } from './catalog';
const filters = (query: string) => readFilters(new URLSearchParams(query));

describe('catalogue navigation and combined filters', () => {
  it('classifies every existing product without changing its commercial or layout data', () => {
    expect(catalogCategories).toHaveLength(8);
    expect(products).toEqual(rawProducts);
    for (const p of products) {
      const m = metadata(p);
      expect(catalogCategories.find(c => c.id === m.category)?.children.some(([id]) => id === m.subcategory)).toBe(true);
      expect(m.brand).not.toBe('');
    }
  });
  it('combines family, subtype, brand, price, color and search', () => {
    const result = filterProducts(products, filters('category=input&subcategory=mouse&brand=Apple&price=100000&color=화이트&q=Magic'));
    expect(result.map(p => p.id)).toEqual(['apple-mxk53kh']);
    expect(filterProducts(products, filters('category=input&brand=IKEA'))).toEqual([]);
  });
  it('keeps empty top-level categories but only offers populated children', () => {
    expect(populatedChildren('desks')).toEqual([]);
    expect(populatedChildren('input').map(([id]) => id)).toEqual(['keyboard', 'mouse']);
    expect(filterProducts(products, filters('category=desks'))).toEqual([]);
  });
  it('does not invent recommendations; supports both tags and intersection with filters', () => {
    expect(filterProducts(products, filters('recommendation=value'))).toEqual([]);
    const id = products[0].id;
    catalogOverrides[id] = { recommendations: ['value', 'curator'] };
    try {
      expect(filterProducts(products, filters('recommendation=value&category=monitors')).map(p => p.id)).toEqual([id]);
      expect(filterProducts(products, filters('recommendation=curator')).map(p => p.id)).toEqual([id]);
      expect(filterProducts(products, filters('recommendation=curator&brand=Apple'))).toEqual([]);
    } finally { delete catalogOverrides[id]; }
  });
  it('handles old category links, stale subcategories, and invalid prices', () => {
    expect(filters('category=1').category).toBe('monitors');
    expect(filters('category=lighting&subcategory=mouse').subcategory).toBe('');
    expect(filters('price=oops').price).toBe(Infinity);
    expect(filters('category=unknown').category).toBe('');
  });
  it('sorts filtered results without mutating the source', () => {
    const ids = products.map(p => p.id);
    const list = filterProducts(products, filters('sort=price-high'));
    expect(list.every((p, i) => !i || list[i - 1].price >= p.price)).toBe(true);
    expect(products.map(p => p.id)).toEqual(ids);
  });
});
