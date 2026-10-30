import { sameSetup, type DeskSetup } from './desk';

export type DeskHistory = { past: DeskSetup[]; present: DeskSetup; future: DeskSetup[]; start: DeskSetup | null };
export type HistoryAction =
  | { type: 'set'; value: DeskSetup | ((previous: DeskSetup) => DeskSetup) }
  | { type: 'begin' | 'end' | 'undo' | 'redo' }
  | { type: 'reset'; value: DeskSetup };
export const createHistory = (present: DeskSetup): DeskHistory => ({ past: [], present, future: [], start: null });
const push = (past: DeskSetup[], value: DeskSetup) => [...past, value].slice(-50);
export function deskHistory(state: DeskHistory, action: HistoryAction): DeskHistory {
  if (action.type === 'reset') return createHistory(action.value);
  if (action.type === 'begin') return state.start ? state : { ...state, start: state.present };
  if (action.type === 'set') {
    const next = typeof action.value === 'function' ? action.value(state.present) : action.value;
    if (sameSetup(state.present, next)) return state;
    return { ...state, present: next, past: state.start ? state.past : push(state.past, state.present), future: state.start ? state.future : [] };
  }
  if (state.start) {
    const changed = !sameSetup(state.start, state.present);
    state = { ...state, past: changed ? push(state.past, state.start) : state.past, future: changed ? [] : state.future, start: null };
  }
  if (action.type === 'undo' && state.past.length) return { ...state, past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] };
  if (action.type === 'redo' && state.future.length) return { ...state, past: push(state.past, state.present), present: state.future[0], future: state.future.slice(1) };
  return state;
}
