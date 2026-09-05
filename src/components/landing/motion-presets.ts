"use client";

import { useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";

/** Shared easing for every landing reveal (ease-out-expo). */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

type RevealOptions = {
  /** Vertical offset the item travels from. */
  y?: number;
  /** Gap between consecutive children in a group. */
  stagger?: number;
  /** Duration of a single item's reveal. */
  duration?: number;
};

/**
 * Reveal preset for the landing page.
 *
 * The parent carries `container` + one of `whenInView` / `onMount`, the children
 * carry `item`. Orchestrating from the parent means a group of N cards costs one
 * IntersectionObserver and one variant object instead of N of each, and the
 * stagger is driven by motion's own scheduler rather than N hardcoded delays.
 *
 * Honours `prefers-reduced-motion`: the travel and the stagger collapse to zero
 * so the content still fades in, but nothing slides.
 */
export function useReveal(options: RevealOptions = {}) {
  const reduced = useReducedMotion();

  const y = reduced ? 0 : options.y ?? 16;
  const stagger = reduced ? 0 : options.stagger ?? 0.08;
  const duration = reduced ? 0.2 : options.duration ?? 0.55;

  const transition: Transition = { duration, ease: EASE_OUT_EXPO };

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition },
  };

  return {
    container,
    item,
    /** Spread on the parent to reveal when the group scrolls into view. */
    whenInView: {
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, margin: "-40px" },
    },
    /** Spread on the parent to reveal immediately on mount (above the fold). */
    onMount: {
      initial: "hidden",
      animate: "visible",
    },
    reduced: Boolean(reduced),
  } as const;
}
