import { describe, expect, it } from 'vitest';
import { emptySetup, footprint, isOutside, newItem, newPlacement, parseSetup, productById, rotateItem, sameSetup, totalPrice } from './desk';

const keyboard = productById.get('soft-keyboard')!;
const item = { instance_id: 'one', product_id: keyboard.id, x_mm: 100, y_mm: 200 };
describe('desk data validation and geometry', () => {
  it('moves and rotates each MR4 cabinet independently and charges once per pair', () => {
    const p = productById.get('edifier-mr4')!;
    const [active, passive] = newPlacement(p, emptySetup());
    expect(footprint(active)).toEqual({ w: 140, d: 197.5 });
    expect(passive.x_mm).toBeGreaterThan(active.x_mm + 140);
    const edited = { ...rotateItem(passive), x_mm: 30, y_mm: 55 };
    expect(footprint(edited)).toEqual({ w: 184, d: 140 });
    const setup = { ...emptySetup(), items: [active, edited] };
    expect(parseSetup(JSON.parse(JSON.stringify(setup)))).toEqual(setup);
    expect(totalPrice([...setup.items, ...newPlacement(p, setup)])).toBe(p.price * 2);
  });
  it('splits an old rotated pair inside its previous bounds and reloads it consistently', () => {
    const old = { ...emptySetup(), items: [{ ...item, product_id: 'edifier-mr4', rotation: 90 as const }] };
    const migrated = parseSetup(old);
    expect(migrated.items).toHaveLength(2);
    expect(migrated.items[0]).toMatchObject({ x_mm: 100, y_mm: 200, rotation: 90 });
    expect(migrated.items[1]).toMatchObject({ x_mm: 113.5, y_mm: 340, rotation: 90, passive_of: 'one' });
    expect(parseSetup(migrated)).toEqual(migrated);
    expect(sameSetup(migrated, old)).toBe(true);
  });
  it('round trips the database payload, including negative and fractional positions', () => {
    const setup = { ...emptySetup(), items: [{ ...item, x_mm: -10.5, y_mm: 20.25 }] };
    expect(parseSetup(JSON.parse(JSON.stringify(setup)))).toEqual(setup);
  });
  it('rejects malformed items and unsupported product ids before replacing a draft', () => {
    for (const bad of [null, {}, [1], [{ ...item, instance_id: '' }], [{ ...item, x_mm: '10' }], [{ ...item, x_mm: Infinity }], [{ ...item, product_id: 'no-such-product' }], [item, item]]) {
      expect(() => parseSetup({ ...emptySetup(), items: bad })).toThrow();
    }
  });
  it('accepts an empty desk and rejects invalid dimensions', () => {
    expect(parseSetup(emptySetup())).toEqual(emptySetup());
    for (const width of [0, -1, 1.5, '1400', Infinity]) expect(() => parseSetup({ ...emptySetup(), desk_width_mm: width })).toThrow();
  });
  it('counts duplicate products separately with unique instance ids', () => {
    const first = newItem(keyboard, emptySetup());
    const setup = { ...emptySetup(), items: [first] };
    const second = newItem(keyboard, setup);
    expect(first.instance_id).not.toBe(second.instance_id);
    expect(parseSetup({ ...setup, items: [first, second] }).items).toHaveLength(2);
    expect(totalPrice([first, second])).toBe(118000);
    expect(totalPrice([second])).toBe(59000);
  });
  it('checks footprint boundaries, including exact edge contact', () => {
    const setup = emptySetup();
    expect(isOutside({ ...item, x_mm: setup.desk_width_mm - keyboard.w, y_mm: setup.desk_depth_mm - keyboard.d }, setup)).toBe(false);
    expect(isOutside({ ...item, x_mm: setup.desk_width_mm - keyboard.w + 1 }, setup)).toBe(true);
    expect(isOutside({ ...item, y_mm: -1 }, setup)).toBe(true);
  });
  it('recognizes saved layouts regardless of database metadata', () => {
    const setup = { ...emptySetup(), items: [item] };
    expect(sameSetup(setup, { ...setup, user_id: 'user', updated_at: 'date' } as typeof setup)).toBe(true);
    expect(sameSetup(setup, { ...setup, items: [{ ...item, x_mm: 120 }] })).toBe(false);
  });
});
