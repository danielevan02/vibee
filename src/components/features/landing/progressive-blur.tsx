"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressiveBottomBlurProps {
  height?: string;
  className?: string;
}

/**
 * Progressive Bottom Blur (Fog Blur / Gradient Backdrop Filter)
 *
 * Stacks 6 exponentially-eased backdrop blur layers to create a buttery-smooth
 * transition where content melts into the bottom edge of the screen.
 * Does not block clicks or interaction (`pointer-events-none`).
 */
export default function ProgressiveBottomBlur({
  height = "h-24 sm:h-32 md:h-40",
  className = "",
}: ProgressiveBottomBlurProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("fixed bottom-0 left-0 right-0 z-40 pointer-events-none", height, className)}
    >
      {/* Layer 1: 1px subtle micro-blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
        }}
      />

      {/* Layer 2: 2px blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          maskImage: "linear-gradient(to bottom, transparent 15%, black 35%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 15%, black 35%, black 100%)",
        }}
      />

      {/* Layer 3: 4px blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "linear-gradient(to bottom, transparent 30%, black 50%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 30%, black 50%, black 100%)",
        }}
      />

      {/* Layer 4: 8px blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          maskImage: "linear-gradient(to bottom, transparent 45%, black 65%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 65%, black 100%)",
        }}
      />

      {/* Layer 5: 16px blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: "linear-gradient(to bottom, transparent 60%, black 80%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 60%, black 80%, black 100%)",
        }}
      />

      {/* Layer 6: 28px deep soft blur at the bottom edge */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          maskImage: "linear-gradient(to bottom, transparent 75%, black 95%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 75%, black 95%, black 100%)",
        }}
      />

      {/* Atmospheric color gradient to smoothly feather into the page background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--background) 8%, transparent) 25%, color-mix(in oklab, var(--background) 35%, transparent) 55%, color-mix(in oklab, var(--background) 75%, transparent) 85%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
