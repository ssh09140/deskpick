import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DeskPreview } from '../components/DeskCanvas';
import { createHistory, deskHistory } from './history';
import { emptySetup, footprint, isOutside, parseSetup, rotateItem, sameSetup, type DeskItem } from './desk';

const item: DeskItem = { instance_id: 'keyboard', product_id: 'apple-mxcl3kh', x_mm: 100, y_mm: 200 };
const initial = { ...emptySetup(), items: [item] };
describe('rotation and undo history', () => {
  it('renders saved rotated layouts as a diagram, never as a product photo', () => {
    const markup = renderToStaticMarkup(createElement(DeskPreview, { setup: { ...initial, items: [rotateItem(item)] } }));
    expect(markup).toContain('rotate(90deg)');
    expect(markup).toContain('<svg');
    expect(markup).not.toContain('<img');
  });
  it('preserves the centre and returns to the original footprint after four rotations', () => {
    const rotated = rotateItem(item);
    expect(footprint(rotated)).toEqual({ w: 114.9, d: 278.9 });
    expect(rotated.x_mm + footprint(rotated).w / 2).toBeCloseTo(item.x_mm + footprint(item).w / 2);
    expect(rotated.y_mm + footprint(rotated).d / 2).toBeCloseTo(item.y_mm + footprint(item).d / 2);
    const restored = rotateItem(rotateItem(rotateItem(rotated)));
    expect(restored.rotation).toBe(0);
    expect(restored.x_mm).toBeCloseTo(item.x_mm);
    expect(restored.y_mm).toBeCloseTo(item.y_mm);
  });
  it('validates angles, preserves saved rotations and supports old layouts', () => {
    expect(parseSetup(initial)).toEqual(initial);
    const rotated = { ...initial, items: [rotateItem(item)] };
    expect(parseSetup(JSON.parse(JSON.stringify(rotated)))).toEqual(rotated);
    expect(sameSetup(initial, { ...initial, items: [{ ...item, rotation: 0 }] })).toBe(true);
    for (const rotation of [45, -90, 360, '90', null]) expect(() => parseSetup({ ...initial, items: [{ ...item, rotation }] })).toThrow();
    expect(isOutside({ ...item, rotation: 90, x_mm: 0, y_mm: 600 }, initial)).toBe(true);
    expect(isOutside({ ...item, x_mm: 0, y_mm: 600 }, initial)).toBe(false);
  });
  it('undoes a whole drag in one step and redoes its final position', () => {
    let state = deskHistory(createHistory(initial), { type: 'begin' });
    for (let x = 101; x <= 150; x++) state = deskHistory(state, { type: 'set', value: s => ({ ...s, items: [{ ...item, x_mm: x }] }) });
    state = deskHistory(state, { type: 'end' });
    expect(state.past).toHaveLength(1);
    state = deskHistory(state, { type: 'undo' });
    expect(state.present).toEqual(initial);
    state = deskHistory(state, { type: 'redo' });
    expect(state.present.items[0].x_mm).toBe(150);
  });
  it('restores removed products, desk size and rotations, and discards redo after a new edit', () => {
    let state = createHistory(initial);
    const rotated = { ...initial, items: [rotateItem(item)] };
    for (const value of [rotated, { ...rotated, desk_width_mm: 1000 }, { ...rotated, desk_width_mm: 1000, items: [] }]) state = deskHistory(state, { type: 'set', value });
    state = deskHistory(state, { type: 'undo' });
    expect(state.present.items[0].rotation).toBe(90);
    state = deskHistory(state, { type: 'undo' });
    expect(state.present).toEqual(rotated);
    state = deskHistory(state, { type: 'set', value: initial });
    expect(state.future).toHaveLength(0);
    expect(deskHistory(state, { type: 'redo' }).present).toEqual(initial);
  });
  it('does not record clicks or no-op edits, bounds history and clears it on account deletion', () => {
    let state = createHistory(initial);
    state = deskHistory(deskHistory(state, { type: 'begin' }), { type: 'end' });
    state = deskHistory(state, { type: 'set', value: initial });
    expect(state.past).toHaveLength(0);
    for (let width = 100; width < 170; width++) state = deskHistory(state, { type: 'set', value: { ...initial, desk_width_mm: width } });
    expect(state.past).toHaveLength(50);
    state = deskHistory(state, { type: 'reset', value: emptySetup() });
    expect(deskHistory(state, { type: 'undo' }).present).toEqual(emptySetup());
  });
});
