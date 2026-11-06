import { describe, expect, it } from 'vitest';
import { products } from './desk';
import rawProducts from '../data/products.json';
import { catalogCategories, catalogOverrides, filterProducts, metadata, populatedChildren, readFilters } from './catalog';
const filters = (query: string) => readFilters(new URLSearchParams(query));

describe('catalogue navigation and combined filters', () => {
  it('filters mice independently of keyboards with horizontal footprints', () => {
    expect(filterProducts(products, filters('category=input&subcategory=mouse'))).toHaveLength(4);
    expect(filterProducts(products, filters('category=input&subcategory=mouse&brand=로지텍'))).toHaveLength(3);
    expect(filterProducts(products, filters('category=input&brand=ATK VXE&color=블랙'))[0]).toMatchObject({ id: 'atk-vxe-r1-se-plus', w: 64, d: 120.6 });
  });
  it('separates desk mats from cable holders and preserves set pricing', () => {
    expect(filterProducts(products, filters('category=organization&subcategory=desk-pad'))).toHaveLength(2);
    expect(filterProducts(products, filters('category=organization&brand=야스트&color=아이보리'))[0]).toMatchObject({ type: 'mat', w: 800, d: 400 });
    expect(filterProducts(products, filters('category=organization&subcategory=cable-organizer'))[0]).toMatchObject({ id: 'machlink-ml-mhwt6', price: 2610, w: 120, d: 20 });
  });
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
    const result = filterProducts(products, filters('category=monitors&subcategory=monitor-stand&brand=일리안&price=100000&color=블랙&q=Medium'));
    expect(result.map(p => p.id)).toEqual(['ilian-basic-medium-black']);
    expect(filterProducts(products, filters('category=input&brand=IKEA'))).toEqual([]);
  });
  it('keeps empty top-level categories but only offers populated children', () => {
    expect(populatedChildren('audio')).toEqual([['speaker', '스피커']]);
    expect(populatedChildren('input')).toEqual([['keyboard', '키보드'], ['mouse', '마우스']]);
    expect(catalogCategories.some(c => c.id === 'audio')).toBe(true);
    expect(filters('category=audio').category).toBe('audio');
  });
  it('filters the six Edifier speaker sets with pair footprints and prices', () => {
    const speakers = filterProducts(products, filters('category=audio&subcategory=speaker&brand=에디파이어'));
    expect(speakers).toHaveLength(6);
    expect(filterProducts(products, filters('category=audio&color=화이트&price=120000')).map(p => p.id)).toEqual(['edifier-mr3']);
    expect(speakers.find(p => p.id === 'edifier-mr4-mkii')).toMatchObject({ w: 280, d: 229, price: 199000 });
    expect(speakers.find(p => p.id === 'edifier-mr4')).toMatchObject({ w: 280, d: 197.5, price: 129000 });
  });
  it('finds Vertitap power strips by charging category, budget and offered color', () => {
    expect(populatedChildren('charging')).toEqual([['hub', 'USB 허브·도킹스테이션'], ['power-strip', '멀티탭']]);
    expect(filterProducts(products, filters('category=charging&subcategory=power-strip&brand=버티탭&color=핑크&price=50000')).map(p => p.id)).toEqual(['vertitap-basic', 'vertitap-65']);
    expect(filterProducts(products, filters('category=charging'))).toHaveLength(5);
  });
  it('separates CalDigit docks from power strips with upright footprints', () => {
    const docks = filterProducts(products, filters('category=charging&subcategory=hub&brand=칼디짓'));
    expect(docks).toHaveLength(2);
    expect(docks.find(p => p.id === 'caldigit-ts4')).toMatchObject({ w: 42, d: 113, price: 599000 });
    expect(filterProducts(products, filters('category=charging&subcategory=hub&color=블랙'))[0]).toMatchObject({ id: 'caldigit-ts5-plus', w: 47, d: 127.9 });
    expect(filterProducts(products, filters('category=charging&subcategory=power-strip&brand=칼디짓'))).toEqual([]);
  });
  it('separates monitor lights from desk lamps and filters each brand', () => {
    expect(populatedChildren('lighting')).toEqual([['monitor-light', '모니터 조명']]);
    expect(filterProducts(products, filters('category=lighting&subcategory=monitor-light'))).toHaveLength(2);
    expect(filterProducts(products, filters('category=lighting&brand=엘레센스&price=100000')).map(p => p.id)).toEqual(['elesense-e1132']);
    expect(filterProducts(products, filters('category=lighting&brand=벤큐&color=블랙')).map(p => p.id)).toEqual(['benq-screenbar-pro']);
  });
  it('finds keyboards by brand, budget and name with their real footprints', () => {
    expect(filterProducts(products, filters('category=input&subcategory=keyboard'))).toHaveLength(4);
    expect(filterProducts(products, filters('category=input&brand=AULA 독거미&price=70000')).map(p => p.id)).toEqual(['aula-f87-pro']);
    expect(filterProducts(products, filters('category=input&brand=프리플로우'))).toHaveLength(2);
    expect(filterProducts(products, filters('q=솜사탕'))[0]).toMatchObject({ id: 'aula-f99', w: 390.63, d: 146.78, price: 77000 });
    expect(filterProducts(products, filters('q=AK68'))[0]).toMatchObject({ w: 444, d: 141 });
  });
  it('finds standing desks by family, subtype, brand, color and budget', () => {
    expect(populatedChildren('desks')).toEqual([['standard-desk', '일반 책상'], ['standing-desk', '모션데스크']]);
    const result = filterProducts(products, filters('category=desks&subcategory=standing-desk&brand=핏쳐&color=화이트&price=300000'));
    expect(result.map(p => p.id)).toEqual(['fiture-m1-plus-1400-white', 'fiture-e1-plus-1400-white']);
    expect(filterProducts(products, filters('category=desks'))).toHaveLength(6);
  });
  it('separates Desker standard and motion desks in combined filters', () => {
    expect(filterProducts(products, filters('category=desks&brand=데스커&subcategory=standard-desk&color=화이트&price=300000')).map(p => p.id)).toEqual(['desker-computer-2-1400-white']);
    expect(filterProducts(products, filters('category=desks&brand=데스커&subcategory=standing-desk')).map(p => p.id)).toEqual(['desker-motion-plus-1400-white']);
  });
  it('does not invent recommendations; supports both tags and intersection with filters', () => {
    expect(filterProducts(products, filters('recommendation=value'))).toEqual([]);
    const id = 'ilian-basic-medium-black';
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
