"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";

type PillRect = { x: number; y: number; width: number; height: number };

// useLayoutEffect warns during SSR; the pill is only ever measured in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Drives a single sliding pill across a set of items - the same mechanic as the
 * hover pill in the landing navbar.
 *
 * The pill is mounted once and moved by animating its own box (x/y/width/height)
 * rather than by a shared `layoutId`. A layoutId transition morphs boxes with
 * scaleX/scaleY, which stretches the border radius into an ellipse and thickens
 * the 1px border whenever the items differ in width - very visible here, where
 * "Chronological" and "Frequencies" are different lengths.
 *
 * Usage: spread `containerRef` on the (relatively positioned) track, give each
 * item `ref={setItemRef}` plus `data-pill-key="<key>"`, and feed `rect` into a
 * `motion.span`. `instant` is true only for the very first placement, so the
 * pill appears under the active item instead of flying in from the left edge.
 */
export function useSlidingPill(activeKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [rect, setRect] = useState<PillRect | null>(null);
  const placed = useRef(false);
  const reducedMotion = useReducedMotion();

  // Stable identity, so React does not detach/reattach every item each render.
  const setItemRef = useCallback((el: HTMLElement | null) => {
    const key = el?.dataset.pillKey;
    if (el && key) itemRefs.current.set(key, el);
  }, []);

  const measure = useCallback(() => {
    const el = itemRefs.current.get(activeKey);
    if (!el) return;
    setRect((prev) => {
      const next = {
        x: el.offsetLeft,
        y: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      };
      if (
        prev &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
  }, [activeKey]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (rect) placed.current = true;
  }, [rect]);

  // Re-measure when the track resizes (breakpoint change, font swap, zoom).
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  return {
    containerRef,
    setItemRef,
    rect,
    // Skip the travel on the first placement, and for anyone who asked the OS
    // to reduce motion.
    instant: !placed.current || Boolean(reducedMotion),
  };
}
