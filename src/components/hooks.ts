import { type DependencyList, type EffectCallback, useEffect as reactUseEffect } from 'react';

// Intention-revealing wrappers over React's raw effect primitive.
//
// The lint config steers code away from reaching for `useEffect` reflexively
// (most effects should be derived state or event handlers). These wrappers are
// the sanctioned escape hatch for the few genuine synchronization effects the
// address/tax inputs need: emitting computed validation/tax state to parent
// callbacks. Centralizing them keeps every call site explicit about intent.

/** Runs `effect` once, after the initial mount. */
export function useMountEffect(effect: EffectCallback): void {
  reactUseEffect(effect, []);
}

/** Runs `effect` on mount and whenever a value in `deps` changes. */
export function useReactiveEffect(effect: EffectCallback, deps: DependencyList): void {
  reactUseEffect(effect, deps);
}
