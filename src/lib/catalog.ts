import { products, type Product } from './desk';

export const catalogCategories = [
  { id: 'desks', name: '책상', icon: 'desk', children: [['standard-desk', '일반 책상'], ['standing-desk', '모션데스크']] },
  { id: 'monitors', name: '모니터·거치대', icon: 'stand', children: [['monitor', '모니터'], ['monitor-arm', '모니터암'], ['monitor-stand', '모니터 받침대'], ['laptop-stand', '노트북 거치대'], ['device-stand', '태블릿·휴대폰 거치대']] },
  { id: 'input', name: '키보드·마우스', icon: 'keyboard', children: [['keyboard', '키보드'], ['mouse', '마우스'], ['palm-rest', '팜레스트']] },
  { id: 'audio', name: '오디오·마이크', icon: 'audio', children: [['speaker', '스피커'], ['headphones', '헤드셋·헤드폰'], ['headset-stand', '헤드셋 거치대'], ['microphone', '마이크'], ['mic-arm', '마이크암']] },
  { id: 'lighting', name: '조명', icon: 'lamp', children: [['monitor-light', '모니터 조명'], ['desk-light', '스탠드 조명'], ['mood-light', '무드등']] },
  { id: 'charging', name: '충전·연결', icon: 'charging', children: [['wireless-charger', '무선충전기'], ['wired-charger', '유선충전기'], ['hub', 'USB 허브·도킹스테이션'], ['power-strip', '멀티탭']] },
  { id: 'organization', name: '패드·수납·정리', icon: 'mat', children: [['desk-pad', '데스크패드·마우스패드'], ['tray', '수납 트레이'], ['drawer', '미니 서랍장'], ['organizer', '연필꽂이·도구 정리함'], ['cable-organizer', '케이블 정리용품'], ['cable-tray', '케이블 트레이·멀티탭 거치대']] },
  { id: 'accessories', name: '데스크 소품', icon: 'clock', children: [['clock', '탁상시계'], ['plant', '화분·식물'], ['coaster', '코스터'], ['decoration', '장식 소품']] },
];
export const recommendations = [{ id: '', name: '전체 제품' }, { id: 'value', name: '가성비 추천' }];
export type CatalogMeta = { category: string; subcategory: string; brand: string; colors: string[]; recommendations: 'value'[] };
// Existing product IDs, prices, links and saved layouts stay unchanged.
// Only explicitly selected products receive recommendation flags.
const categoryForLegacy: Record<number, string> = { 1: 'monitors', 2: 'input', 3: 'lighting', 4: 'organization', 5: 'organization', 6: 'accessories', 7: 'desks', 8: 'audio', 9: 'charging' };
export function metadata(p: Product): CatalogMeta {
  const subcategory = p.cat === 9 ? (p.type === 'hub' ? 'hub' : 'power-strip') : p.cat === 8 ? 'speaker' : p.cat === 7 ? 'standing-desk' : p.cat === 1 ? 'monitor-stand' : p.cat === 2 ? (p.type === 'mouse' ? 'mouse' : 'keyboard') : p.cat === 3 ? (p.type === 'monitor-light' ? 'monitor-light' : 'desk-light') : p.cat === 4 ? 'desk-pad' : p.cat === 5 ? (p.type === 'tray' ? 'tray' : p.type === 'cable-organizer' ? 'cable-organizer' : 'organizer') : 'clock';
  return {
    category: categoryForLegacy[p.cat], subcategory,
    brand: p.id.startsWith('ikea-') ? 'IKEA' : p.id.startsWith('apple-') ? 'Apple' : p.id.startsWith('fiture-') ? '핏쳐' : p.id.startsWith('ilian-') ? '일리안' : p.id.startsWith('edifier-') ? '에디파이어' : p.id.startsWith('vertitap-') ? '버티탭' : p.id.startsWith('benq-') ? '벤큐' : p.id.startsWith('elesense-') ? '엘레센스' : p.id.startsWith('aula-') ? 'AULA 독거미' : p.id.startsWith('preflow-') ? '프리플로우' : p.id.startsWith('desker-') ? '데스커' : p.id.startsWith('caldigit-') ? '칼디짓' : p.id.startsWith('yast-') ? '야스트' : p.id.startsWith('arbon-') ? '아르본드' : p.id.startsWith('machlink-') ? '마하링크' : p.id.startsWith('logitech-') ? '로지텍' : p.id.startsWith('atk-') ? 'ATK VXE' : '',
    colors: p.id.startsWith('vertitap-') ? ['화이트', '블랙', '핑크', '블루'] : p.name.includes('화이트/투명') ? ['화이트', '투명'] : p.name.includes('화이트') ? ['화이트'] : p.name.includes('블랙') ? ['블랙'] : p.name.includes('다크옐로') ? ['옐로'] : [],
    recommendations: [],
    ...catalogOverrides[p.id],
  };
}
// Add confirmed metadata and recommendation flags here when expanding the catalogue.
export const catalogOverrides: Record<string, Partial<CatalogMeta>> = {
  'divoom-ditoo-pro': { subcategory: 'decoration', brand: '디붐' },
  'divoom-minitoo': { subcategory: 'decoration', brand: '디붐' },
  'divoom-times-gate': { subcategory: 'clock', brand: '디붐' },
  'novium-hoverpen-interstellar-black': { subcategory: 'decoration', brand: '노비움', colors: ['블랙'] },
  'benq-screenbar-halo': { colors: ['그레이'] },
  'benq-screenbar-halo-2': { colors: ['다크그레이'] },
  'fiture-e2-1400-white': { recommendations: ['value'] },
  'ilian-basic-medium-black': { recommendations: ['value'] },
  'aula-f87-pro': { recommendations: ['value'] },
  'atk-vxe-r1-se-plus': { recommendations: ['value'] },
  'elesense-e1132': { recommendations: ['value'] },
  'edifier-m60': { recommendations: ['value'] },
  'vertitap-65': { recommendations: ['value'] },
  'logitech-mx-master-4': { colors: ['그래파이트'] },
  'logitech-mx-master-3s': { colors: ['그래파이트'] },
  'yast-m-ivory': { colors: ['아이보리'] },
  'desker-computer-2-1400-white': { subcategory: 'standard-desk' },
};
export const categoryName = (p: Product) => catalogCategories.find(c => c.id === metadata(p).category)?.name ?? '';
export const subcategoryName = (p: Product) => catalogCategories.flatMap(c => c.children).find(([id]) => id === metadata(p).subcategory)?.[1] ?? '';
export const populatedChildren = (category: string) => catalogCategories.find(c => c.id === category)?.children.filter(([id]) => products.some(p => metadata(p).subcategory === id)) ?? [];
export type CatalogFilters = { category: string; subcategory: string; recommendation: string; brand: string; color: string; price: number; query: string; sort: string };
export function readFilters(params: URLSearchParams): CatalogFilters {
  const rawCategory = params.get('category') ?? '';
  const category = categoryForLegacy[Number(rawCategory)] ?? rawCategory;
  const validCategory = catalogCategories.some(c => c.id === category) ? category : '';
  const subcategory = params.get('subcategory') ?? '';
  const price = Number(params.get('price') ?? Infinity);
  return {
    category: validCategory,
    subcategory: catalogCategories.find(c => c.id === validCategory)?.children.some(([id]) => id === subcategory) ? subcategory : '',
    recommendation: params.get('recommendation') === 'value' ? 'value' : '',
    brand: params.get('brand') ?? '', color: params.get('color') ?? '',
    price: price > 0 ? price : Infinity, query: params.get('q') ?? '', sort: params.get('sort') ?? 'default',
  };
}
export function filterProducts(source: Product[], f: CatalogFilters) {
  const result = source.filter(p => {
    const m = metadata(p);
    return (!f.category || m.category === f.category) && (!f.subcategory || m.subcategory === f.subcategory)
      && (!f.recommendation || m.recommendations.some(r => r === f.recommendation))
      && (!f.brand || m.brand === f.brand) && (!f.color || m.colors.includes(f.color)) && p.price <= f.price
      && `${p.name} ${p.tag} ${m.brand} ${categoryName(p)} ${subcategoryName(p)}`.toLowerCase().includes(f.query.trim().toLowerCase());
  });
  if (f.sort === 'price-low') result.sort((a, b) => a.price - b.price);
  if (f.sort === 'price-high') result.sort((a, b) => b.price - a.price);
  return result;
}
