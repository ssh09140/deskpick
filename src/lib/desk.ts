import productData from '../data/products.json';
import legacyData from '../data/legacy-products.json';

export type Product = {
  id: string; name: string; cat: number; price: number; w: number; d: number;
  type: string; desc: string; tag: string; why: string; sample: boolean;
  passive_depth_mm?: number;
  seller_name: string | null; seller_url: string | null; price_checked_at: string | null;
  image_source: string; image_note?: string; image_url?: string; image_source_url?: string; manufacturer_code?: string; dimension_note?: string;
};
export const products: Product[] = productData;
export const isDeskProduct = (p: Product) => p.type === 'desk';
export const placeableProducts = products.filter(p => !isDeskProduct(p));
export function applyDeskSize(setup: DeskSetup, product: Product): DeskSetup {
  if (!isDeskProduct(product)) throw new Error('책상 상품을 선택해 주세요.');
  return { ...setup, desk_product_id: product.id, desk_width_mm: product.w, desk_depth_mm: product.d };
}
export const categories = ['전체', '모니터 받침대', '키보드 · 마우스', '조명', '데스크매트', '수납 · 정리', '데스크 소품', '책상', '오디오·마이크', '충전·연결'];
// Keep old sample identities and dimensions for saved layouts; do not silently replace them.
export const productById = new Map<string, Product>([...legacyData, ...products].map(p => [p.id, p]));
export const availableCategories = categories.map((name, id) => ({ name, id })).filter(c => c.id === 0 || products.some(p => p.cat === c.id));
export type DeskItem = { instance_id: string; product_id: string; x_mm: number; y_mm: number; rotation?: number; passive_of?: string };
export type DeskSetup = { desk_product_id?: string; desk_width_mm: number; desk_depth_mm: number; items: DeskItem[] };
export type SavedSetup = DeskSetup & { user_id: string; created_at: string; updated_at: string };
export const emptySetup = (): DeskSetup => ({ desk_width_mm: 1400, desk_depth_mm: 800, items: [] });
export const money = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
export const purchaseItems = (items: DeskItem[]) => items.filter(item => !item.passive_of);
export const totalPrice = (items: DeskItem[]) => purchaseItems(items).reduce((sum, item) => sum + (productById.get(item.product_id)?.price ?? 0), 0);
export function itemLabel(item: DeskItem) {
  const p = productById.get(item.product_id)!;
  if (!p.passive_depth_mm) return p.name;
  return p.name + (item.passive_of ? ' · 패시브' : ' · 액티브');
}
export function unitSize(item: DeskItem) {
  const p = productById.get(item.product_id)!;
  if (!p.passive_depth_mm) return { w: p.w, d: p.d };
  return { w: p.w / 2, d: item.passive_of ? p.passive_depth_mm : p.d };
}
export function footprint(item: DeskItem) {
  const p = unitSize(item);
  const angle = item.rotation ?? 0;
  if (angle % 180 === 0) return p;
  if (angle % 180 === 90) return { w: p.d, d: p.w };
  const radians = angle * Math.PI / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return { w: p.w * cos + p.d * sin, d: p.w * sin + p.d * cos };

}
export function placementCenter(item: DeskItem) {
  const bounds = footprint(item);
  return { x: item.x_mm + bounds.w / 2, y: item.y_mm + bounds.d / 2 };
}

export function rotateItem(item: DeskItem, angle = (item.rotation ?? 0) + 90): DeskItem {
  const before = footprint(item);
  const rotated = { ...item, rotation: ((Math.round(angle) % 360) + 360) % 360 };
  const after = footprint(rotated);
  return { ...rotated, x_mm: item.x_mm + (before.w - after.w) / 2, y_mm: item.y_mm + (before.d - after.d) / 2 };
}
export const isOutside = (item: DeskItem, setup: DeskSetup) => {
  const product = productById.get(item.product_id);
  if (!product) return true;
  const size = footprint(item);
  return item.x_mm < 0 || item.y_mm < 0 || item.x_mm + size.w > setup.desk_width_mm || item.y_mm + size.d > setup.desk_depth_mm;
};
export function parseSetup(value: unknown): DeskSetup {
  if (!value || typeof value !== 'object') throw new Error('책상 구성 형식을 확인해 주세요.');
  const s = value as Record<string, unknown>;
  if (!Number.isInteger(s.desk_width_mm) || !Number.isInteger(s.desk_depth_mm) || Number(s.desk_width_mm) <= 0 || Number(s.desk_depth_mm) <= 0 || !Array.isArray(s.items)) throw new Error('책상 크기 또는 제품 목록이 올바르지 않아요.');
  const ids = new Set<string>();
  const items: DeskItem[] = s.items.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new Error('배치 정보가 올바르지 않아요.');
    const item = raw as DeskItem;
    if (typeof item.instance_id !== 'string' || !item.instance_id.trim() || ids.has(item.instance_id) || typeof item.product_id !== 'string' || !productById.has(item.product_id) || typeof item.x_mm !== 'number' || typeof item.y_mm !== 'number' || !Number.isFinite(item.x_mm) || !Number.isFinite(item.y_mm)) throw new Error('저장된 구성에 지원하지 않는 제품이나 잘못된 좌표가 있어요. 현재 배치는 유지됩니다.');
    ids.add(item.instance_id);
    if (item.rotation !== undefined && (!Number.isInteger(item.rotation) || item.rotation < 0 || item.rotation >= 360)) throw new Error('저장된 제품의 회전 각도가 올바르지 않아요.');
    if (item.passive_of !== undefined && (typeof item.passive_of !== 'string' || !item.passive_of)) throw new Error('스피커 세트 정보가 올바르지 않아요.');
    return { instance_id: item.instance_id, product_id: item.product_id, x_mm: item.x_mm, y_mm: item.y_mm, ...(item.rotation ? { rotation: item.rotation } : {}), ...(item.passive_of ? { passive_of: item.passive_of } : {}) };
  });
  const byId = new Map(items.map(item => [item.instance_id, item]));
  const paired = new Set<string>();
  for (const item of items) {
    if (!item.passive_of) continue;
    const active = byId.get(item.passive_of);
    if (!active || active.passive_of || active.product_id !== item.product_id || !productById.get(item.product_id)?.passive_depth_mm || paired.has(item.passive_of)) throw new Error('스피커 세트 정보가 올바르지 않아요.');
    paired.add(item.passive_of);
  }
  // Older saves contain one rectangle covering both cabinets.
  const expanded = items.flatMap(item => {
    if (item.passive_of || paired.has(item.instance_id) || !productById.get(item.product_id)?.passive_depth_mm) return [item];
    let id = item.instance_id + '-passive';
    while (ids.has(id)) id += '-2';
    ids.add(id);
    return splitSpeaker(item, id);
  });
  const desk = typeof s.desk_product_id === 'string' ? productById.get(s.desk_product_id) : undefined;
  const selectedDesk = desk && isDeskProduct(desk) && desk.w === s.desk_width_mm && desk.d === s.desk_depth_mm;
  return { ...(selectedDesk ? { desk_product_id: desk.id } : {}), desk_width_mm: s.desk_width_mm as number, desk_depth_mm: s.desk_depth_mm as number, items: expanded };
}
export const sameSetup = (a: DeskSetup, b: DeskSetup) => JSON.stringify(parseSetup(a)) === JSON.stringify(parseSetup(b));
export function newItem(product: Product, setup: DeskSetup): DeskItem {
  const offset = (setup.items.filter(i => i.product_id === product.id).length % 5) * 25;
  return { instance_id: crypto.randomUUID(), product_id: product.id, x_mm: Math.round((setup.desk_width_mm - product.w) / 2 + offset), y_mm: Math.round((setup.desk_depth_mm - product.d) / 2 + offset) };
}

function splitSpeaker(item: DeskItem, passiveId: string): DeskItem[] {
  const { w, d } = unitSize(item);
  const passive: DeskItem = { ...item, instance_id: passiveId, passive_of: item.instance_id };
  const depthDifference = d - unitSize(passive).d;
  const active = { ...item };
  // Place cabinets inside the original bounding box, including rotated saves.
  switch (item.rotation ?? 0) {
    case 0: passive.x_mm += w; break;
    case 90: passive.y_mm += w; passive.x_mm += depthDifference; break;
    case 180: active.x_mm += w; passive.y_mm += depthDifference; break;
    case 270: active.y_mm += w; break;
  }
  return [active, passive];
}

export function newPlacement(product: Product, setup: DeskSetup) {
  const item = newItem(product, setup);
  if (!product.passive_depth_mm) return [item];
  const [active, passive] = splitSpeaker(item, crypto.randomUUID());
  const gap = Math.min(60, Math.max(0, setup.desk_width_mm - product.w));
  active.x_mm -= gap / 2;
  passive.x_mm += gap / 2;
  return [active, passive];
}
