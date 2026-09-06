"use client";

import { useSyncExternalStore } from "react";

// Nothing to subscribe to: the value flips exactly once, when React hydrates.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` during SSR and the first client render, `true` afterwards.
 *
 * Replaces the `useState(false)` + `useEffect(() => setMounted(true))` idiom.
 * That version sets state synchronously inside an effect, which schedules a
 * second render pass and is now flagged by React's rules; `useSyncExternalStore`
 * gives React the server and client values up front, so there is no cascade.
 *
 * Use it to defer anything that cannot match between server and client - most
 * often a theme-dependent asset, which the server cannot know.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
