"use client";

import { useState, useCallback } from "react";
import { User } from "@/db/schema";
import { Flame, Clock } from "lucide-react";
import { motion } from "motion/react";
import InputPost from "@/components/features/post/post-composer";
import PostList from "@/components/features/post/post-list";
import { cn } from "@/lib/utils";
import { useSlidingPill } from "@/hooks/use-sliding-pill";

interface HomeFeedStreamProps {
  user: User;
  initialTab?: "chronological" | "trending";
}

export default function HomeFeedStream({
  user,
  initialTab = "chronological",
}: HomeFeedStreamProps) {
  const [activeSort, setActiveSort] = useState<"chronological" | "trending">(initialTab);
  const { containerRef, setItemRef, rect, instant } = useSlidingPill(activeSort);

  const handleTabChange = useCallback((newSort: "chronological" | "trending") => {
    setActiveSort(newSort);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newSort === "trending") {
        url.searchParams.set("tab", "trending");
      } else {
        url.searchParams.delete("tab");
      }
      window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stream Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            The Feed
          </span>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl tracking-tight text-foreground mt-1">
            Home
          </h1>
          <p className="text-xs font-normal text-muted-foreground mt-1">
            Catch up with the latest vibes and conversations.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div
          ref={containerRef}
          className="relative flex items-center gap-1 p-1 rounded-full bg-muted/30 border border-border/50 text-xs font-normal self-start sm:self-auto backdrop-blur-md"
        >
          {/* Single pill, moved by animating its own box - see useSlidingPill.
              Sits at the default z-index so the `relative` buttons paint above it. */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              x: rect?.x ?? 0,
              y: rect?.y ?? 0,
              width: rect?.width ?? 0,
              height: rect?.height ?? 0,
            }}
            transition={
              instant
                ? { duration: 0 }
                : { type: "spring", stiffness: 450, damping: 34 }
            }
            className="absolute top-0 left-0 rounded-full bg-background border border-border/60 pointer-events-none"
          />
          <button
            type="button"
            id="tab-chronological"
            ref={setItemRef}
            data-pill-key="chronological"
            onClick={() => handleTabChange("chronological")}
            className={cn(
              "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer select-none",
              activeSort === "chronological"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chronological</span>
          </button>
          <button
            type="button"
            id="tab-trending"
            ref={setItemRef}
            data-pill-key="trending"
            onClick={() => handleTabChange("trending")}
            className={cn(
              "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer select-none",
              activeSort === "trending"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame
              className={cn(
                "w-3.5 h-3.5",
                activeSort === "trending" ? "text-foreground" : "text-muted-foreground"
              )}
            />
            <span>Frequencies</span>
          </button>
        </div>
      </div>

      {/* Inline SaaS Post Composer */}
      <InputPost user={user} />

      {/* Main Post Stream */}
      <div className="pt-2">
        <PostList user={user} sort={activeSort} />
      </div>
    </div>
  );
}
