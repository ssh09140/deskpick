import { describe, expect, it } from 'vitest';
import { emptySetup, isOutside, newItem, parseSetup, productById, sameSetup, totalPrice } from './desk';

const keyboard = productById.get('soft-keyboard')!;
const item = { instance_id: 'one', product_id: keyboard.id, x_mm: 100, y_mm: 200 };
describe('desk data validation and geometry', () => {
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
